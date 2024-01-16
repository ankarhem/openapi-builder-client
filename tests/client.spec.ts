import { expect, test, describe, mock, Mock } from 'bun:test';
import { mockedClient } from './utils';
import { Fetcher, MiddlewareFunction } from '../src';
import { joinFormatter, pathFormatter } from '../src/search';

describe('Methods', () => {
  const anyClient = mockedClient as any;
  test('GET', async () => {
    anyClient
      .with({
        fetcher: async (url: string, init: RequestInit) => {
          expect(init?.method).toBe('GET');
          return new Response();
        },
      })
      .get('/')
      .send();
  });
  test('POST', async () => {
    anyClient
      .with({
        fetcher: async (url: string, init: RequestInit) => {
          expect(init?.method).toBe('POST');
          return new Response();
        },
      })
      .post('/')
      .send();
  });
  test('PUT', async () => {
    anyClient
      .with({
        fetcher: async (url: string, init: RequestInit) => {
          expect(init?.method).toBe('PUT');
          return new Response();
        },
      })
      .put('/')
      .send();
  });
  test('DELETE', async () => {
    anyClient
      .with({
        fetcher: async (url: string, init: RequestInit) => {
          expect(init?.method).toBe('DELETE');
          return new Response();
        },
      })
      .delete('/')
      .send();
  });
  test('PATCH', async () => {
    anyClient
      .with({
        fetcher: async (url: string, init: RequestInit) => {
          expect(init?.method).toBe('PATCH');
          return new Response();
        },
      })
      .patch('/')
      .send();
  });
});

describe('Url', () => {
  const client = mockedClient;
  test('Can handle baseUrl with path', async () => {
    client
      .with({
        fetcher: async (url, init) => {
          expect(url).toBe(
            'https://petstore3.swagger.io/api/v3/pet/findByStatus'
          );
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .send();
  });
  test('Can override baseUrl', async () => {
    client
      .with({
        baseUrl: 'https://google.com/',
        fetcher: async (url, init) => {
          expect(url).toBe('https://google.com/pet/findByStatus');
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .send();
  });
  test('Replaces path params', async () => {
    client
      .with({
        fetcher: async (url, init) => {
          expect(url).toBe('https://petstore3.swagger.io/api/v3/pet/1');
          return new Response();
        },
      })
      .get('/pet/{petId}')
      .path({
        petId: 1,
      })
      .send();
  });
});

describe('Headers', () => {
  test('Can set default headers', async () => {
    const client = mockedClient.with({
      headers: {
        'x-default': 'header',
      },
    });
    client
      .with({
        fetcher: async (url, init) => {
          expect(init?.headers).toEqual({
            'x-default': 'header',
          });
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .send();
  });

  test('Can override default header', async () => {
    const client = mockedClient.with({
      headers: {
        api_key: '1234',
      },
    });

    client
      .with({
        fetcher: async (url, init) => {
          expect(init?.headers).toEqual({
            api_key: 'abcd',
          });
          return new Response();
        },
      })
      .delete('/pet/{petId}')
      .__path({})
      .headers({
        api_key: 'abcd',
      })
      .send();
  });

  test('Can add additional header per request', async () => {
    const client = mockedClient.with({
      headers: {
        'x-default': 'header',
      },
    });

    client
      .with({
        fetcher: async (url, init) => {
          expect(init?.headers).toEqual({
            'x-default': 'header',
            api_key: 'abcd',
          });
          return new Response();
        },
      })
      .delete('/pet/{petId}')
      .__path({})
      .headers({
        api_key: 'abcd',
      })
      .send();
  });
});

describe('Body', () => {
  const client = mockedClient;
  test('Using body serializes json', async () => {
    client
      .with({
        fetcher: async (url, init) => {
          const body = init?.body?.valueOf();
          expect(body).toBeString();
          expect(JSON.parse(body as string)).toEqual({
            name: 'hello',
          });
          return new Response();
        },
      })
      .post('/pet')
      .body({
        name: 'hello',
      } as any)
      .send();
  });
  test('Using body sets application/json header', async () => {
    client
      .with({
        fetcher: async (url, init) => {
          const headers = new Headers(init.headers);
          expect(headers.get('Content-Type')).toBe('application/json');
          return new Response();
        },
      })
      .post('/pet')
      .body({} as any)
      .send();
  });
});

describe('Form', () => {
  const client = mockedClient;
  test('Using form sets application/x-www-form-urlencoded header', async () => {
    client
      .with({
        fetcher: async (url, init) => {
          const headers = new Headers(init.headers);
          expect(headers.get('Content-Type')).toBe(
            'application/x-www-form-urlencoded'
          );
          return new Response();
        },
      })
      .post('/pet')
      .form({} as any)
      .send();
  });
});

describe('Middleware', () => {
  test('Can add middleware', async () => {
    const middleware: Mock<MiddlewareFunction> = mock((url, init, next) => {
      return next(url, init);
    });
    const client = mockedClient.with({
      middlewares: [middleware],
    });
    expect(middleware).toHaveBeenCalledTimes(0);
    await client.get('/pet/findByStatus').send();
    expect(middleware).toHaveBeenCalledTimes(1);
  });

  test('Can modify request with middleware', async () => {
    const middleware: Mock<MiddlewareFunction> = mock((url, init, next) => {
      const body = 'bodyString';
      return next('https://google.com', {
        ...init,
        headers: {
          ...init.headers,
          'x-middleware': 'yes',
        },
        body: body,
      });
    });
    await mockedClient
      .with({
        middlewares: [middleware],
        fetcher: async (url, init) => {
          expect(init?.body).toBe('bodyString');
          expect(init?.headers).toEqual({
            'x-middleware': 'yes',
          });
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .send();
    expect(middleware).toHaveBeenCalledTimes(1);
  });

  test('Middleware are run in sequence', async () => {
    const firstMiddleware: Mock<MiddlewareFunction> = mock(
      (url, init, next) => {
        return next('https://first.com', init);
      }
    );
    const secondMiddleware: Mock<MiddlewareFunction> = mock(
      (url, init, next) => {
        expect(url).toBe('https://first.com');
        return next('https://second.com', init);
      }
    );
    await mockedClient
      .with({
        middlewares: [firstMiddleware, secondMiddleware],
        fetcher: async (url, init) => {
          expect(url).toBe('https://second.com');
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .send();
    expect(firstMiddleware).toHaveBeenCalledTimes(1);
    expect(secondMiddleware).toHaveBeenCalledTimes(1);
  });
});

describe('Retries', () => {
  const throwingFetcher: Fetcher = (url, init) => {
    throw new Error('');
  };

  test('Will retry if request throws', async () => {
    const mockedThrowingFetcher: Mock<Fetcher> = mock(throwingFetcher);
    const client = mockedClient.with({
      fetcher: mockedThrowingFetcher,
      retries: 1,
    });
    expect(mockedThrowingFetcher).toHaveBeenCalledTimes(0);
    await client
      .get('/pet/findByStatus')
      .send()
      .catch(() => {});
    expect(mockedThrowingFetcher).toHaveBeenCalledTimes(2);
  });

  test('Middlewares are only called once', async () => {
    const middleware: Mock<MiddlewareFunction> = mock((url, init, next) => {
      return next(url, init);
    });

    const client = mockedClient.with({
      middlewares: [middleware],
      fetcher: throwingFetcher,
      retries: 1,
    });

    expect(middleware).toHaveBeenCalledTimes(0);
    await client
      .get('/pet/findByStatus')
      .send()
      .catch(() => {});
    expect(middleware).toHaveBeenCalledTimes(1);
  });
});

describe('Formatters', () => {
  describe('Body', () => {
    test('Uses defaultFormatter by default', async () => {
      mockedClient
        .with({
          fetcher: async (url, init) => {
            const form = init?.body as URLSearchParams;
            expect(form.getAll('array')).toEqual(['1', '2']);

            return new Response();
          },
        })
        .post('/pet')
        .form({
          array: [1, 2],
        } as any)
        .send();
    });

    test('Can use joinFormatter', async () => {
      mockedClient
        .with({
          formFormatter: joinFormatter,
          fetcher: async (url, init) => {
            const form = init?.body as URLSearchParams;
            expect(form.get('array')).toBe('1,2');

            return new Response();
          },
        })
        .post('/pet')
        .form({ array: [1, 2] } as any)
        .send();
    });

    test('Can use pathFormatter', async () => {
      mockedClient
        .with({
          formFormatter: pathFormatter,
          fetcher: async (url, init) => {
            const form = init?.body as URLSearchParams;
            expect(form.get('array[0]')).toBe('1');
            expect(form.get('array[1]')).toBe('2');

            return new Response();
          },
        })
        .post('/pet')
        .form({ array: [1, 2] } as any)
        .send();
    });
  });

  describe('Query', () => {
    test('Uses defaultFormatter by default', async () => {
      mockedClient
        .with({
          fetcher: async (url, init) => {
            const searchParams = new URL(url).searchParams;
            expect(searchParams.getAll('tags')).toEqual(['1', '2']);

            return new Response();
          },
        })
        .get('/pet/findByTags')
        .query({
          tags: ['1', '2'],
        })
        .send();
    });

    test('Can use joinFormatter', async () => {
      mockedClient
        .with({
          formFormatter: joinFormatter,
          fetcher: async (url, init) => {
            const searchParams = new URL(url).searchParams;
            expect(searchParams.get('tags')).toBe('1,2');

            return new Response();
          },
        })
        .get('/pet/findByTags')
        .query({
          tags: ['1', '2'],
        })
        .send();
    });

    test('Can use pathFormatter', async () => {
      mockedClient
        .with({
          formFormatter: pathFormatter,
          fetcher: async (url, init) => {
            const searchParams = new URL(url).searchParams;
            expect(searchParams.get('tags[0]')).toBe('1');
            expect(searchParams.get('tags[1]')).toBe('2');

            return new Response();
          },
        })
        .get('/pet/findByTags')
        .query({
          tags: ['1', '2'],
        })
        .send();
    });
  });
});
