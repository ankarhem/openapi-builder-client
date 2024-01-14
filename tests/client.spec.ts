import { expect, test, describe, mock, Mock } from 'bun:test';
import { mockedClient } from './utils';
import { MiddlewareFunction } from '../src';

describe('Can use all methods', () => {
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

describe('Correctly constructs url', () => {
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
  const client = mockedClient.with({
    headers: {
      'x-hello': 'world',
    },
  });
  test('Can set default headers', async () => {
    client
      .with({
        fetcher: async (url, init) => {
          expect(init?.headers).toEqual({
            'x-hello': 'world',
          });
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .send();
  });

  test('Can override default header', async () => {
    client
      .with({
        headers: {
          'x-hello': 'overridden',
        },
        fetcher: async (url, init) => {
          expect(init?.headers).toEqual({
            'x-hello': 'overridden',
          });
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .send();
    client
      .with({
        fetcher: async (url, init) => {
          expect(init?.headers).toEqual({
            'x-hello': 'overridden',
          });
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .__headers({
        'x-hello': 'overridden',
      })
      .send();
  });

  test('Can add additional header per request', async () => {
    client
      .with({
        headers: {
          'x-something': 'else',
        },
        fetcher: async (url, init) => {
          expect(init?.headers).toEqual({
            'x-hello': 'world',
            'x-something': 'else',
          });
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .send();
    client
      .with({
        fetcher: async (url, init) => {
          expect(init?.headers).toEqual({
            'x-hello': 'world',
            'x-something': 'else',
          });
          return new Response();
        },
      })
      .get('/pet/findByStatus')
      .__headers({
        'x-something': 'else',
      })
      .send();
  });

  test('Can add headers if defined in openapi', async () => {
    client
      .with({
        fetcher: async (url, init) => {
          expect(init?.headers).toEqual({
            'x-hello': 'world',
            api_key: 'abc123',
          });
          return new Response();
        },
      })
      .delete('/pet/{petId}')
      .headers({
        api_key: 'abc123',
      })
      .path({ petId: 1 });
  });
});

describe('Body', () => {
  const client = mockedClient;
  test('Can set json body', async () => {
    client
      .with({
        fetcher: async (url, init) => {
          const body = init?.body?.valueOf();
          expect(body).toEqual({
            name: 'Jane',
            photoUrls: ['1', '2'],
          });
          return new Response();
        },
      })
      .post('/pet')
      .body({
        name: 'Jane',
        photoUrls: ['1', '2'],
      })
      .send();
  });
  test('Can arbitrary body using override method', async () => {
    client
      .with({
        fetcher: async (url, init) => {
          const body = init?.body?.valueOf();
          expect(body).toEqual({
            test: 1,
          });
          return new Response();
        },
      })
      .post('/pet')
      .__body({
        test: 1,
      })
      .send();
  });
});

describe('Middleware', () => {
  test('Can add middleware', async () => {
    const middleware = mock((url, init, next) => {
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
