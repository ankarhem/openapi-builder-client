import { describe, expect, test } from 'bun:test';
import { defaultFormatter, joinFormatter } from '../src';
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
      jsonArray: [{ a: 1 }, { b: 2 }],
    };
    const form = defaultFormatter(data);

    expect(form.get('json')).toEqual(JSON.stringify(data.json));
    expect(form.getAll('jsonArray')).toEqual(
      data.jsonArray.map((i) => JSON.stringify(i))
    );
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
});

describe('joinFormatter', () => {
  test('Handles basic data', () => {
    const data = {
      number: 1,
      boolean: true,
      string: 'hello',
      float: 2.1,
    };
    const form = joinFormatter(data);

    expect(form.get('number')).toBe('1');
    expect(form.get('boolean')).toBe('true');
    expect(form.get('string')).toBe('hello');
    expect(form.get('float')).toBe('2.1');
  });

  test('Joins array values', () => {
    const data = {
      array: [1, 2],
    };
    const form = joinFormatter(data);

    expect(form.get('array')).toBe('1,2');
  });

  test('Converts json values to escaped string', () => {
    const data = {
      json: {
        a: 1,
      },
      jsonArray: [{ a: 1 }, { b: 2 }],
    };
    const form = joinFormatter(data);

    expect(form.get('json')).toBe(JSON.stringify(data.json));
    expect(form.get('jsonArray')).toBe(
      data.jsonArray.map((i) => JSON.stringify(i)).join(',')
    );
  });
});
