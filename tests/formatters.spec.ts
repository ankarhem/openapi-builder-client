import { describe, expect, test } from 'bun:test';
import { defaultFormatter } from '../src';
import { mockedClient } from './utils';

describe('defaultFormatter', () => {
  test('Handles basic data', () => {
    const data = {
      number: 1,
      boolean: true,
      string: 'hello',
      float: 2.1,
    };
    const form = defaultFormatter(data);

    expect(form.get('number')).toBe('1');
    expect(form.get('boolean')).toBe('true');
    expect(form.get('string')).toBe('hello');
    expect(form.get('float')).toBe('2.1');
  });

  test('Does not join array values', () => {
    const data = {
      array: [1, 2],
    };
    const form = defaultFormatter(data);

    expect(form.getAll('array')).toEqual(['1', '2']);
  });

  test('Converts json values to escaped string', () => {
    const data = {
      json: {
        a: 1,
      },
      jsonArray: [{ a: 1 }],
    };
    const form = defaultFormatter(data);

    expect(form.get('json')).toEqual(JSON.stringify(data.json));
    expect(form.getAll('jsonArray')).toEqual([
      JSON.stringify(data.jsonArray[0]),
    ]);
  });

  test('Using form method constructs URLSearchParams object', async () => {
    mockedClient
      .with({
        fetcher: async (url, init) => {
          expect(init.body).toBeInstanceOf(URLSearchParams);
          return new Response();
        },
      })
      .post('/pet')
      .form({} as any)
      .send();
  });

  test('form method uses defaultFormatter', async () => {
    const data = {
      name: 'hello',
      photoUrls: ['url', 'url2'],
      tags: [
        { id: 1, name: 'tag1' },
        { id: 2, name: 'tag2' },
      ],
      category: {
        id: 1,
        name: 'cat',
      },
    };
    mockedClient
      .with({
        fetcher: async (url, init) => {
          const form = init?.body as URLSearchParams;
          expect(form.get('name')).toBe('hello');
          expect(form.getAll('photoUrls')).toEqual(data.photoUrls);
          expect(form.getAll('tags')).toEqual(
            data.tags.map((i) => JSON.stringify(i))
          );
          expect(form.get('category')).toBe(JSON.stringify(data.category));

          return new Response();
        },
      })
      .post('/pet')
      .form(data)
      .send();
  });
});
