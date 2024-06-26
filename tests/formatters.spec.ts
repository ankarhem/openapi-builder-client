import { describe, expect, test } from 'vitest';
import { htmlFormatter, joinFormatter, pathFormatter } from '../src/formatters';
import { mockedClient } from './utils';

describe('defaultFormatter', () => {
  test('Handles basic data', () => {
    const data = {
      number: 1,
      boolean: true,
      string: 'hello',
      float: 2.1,
    };
    const form = htmlFormatter(data);

    expect(form.get('number')).toBe('1');
    expect(form.get('boolean')).toBe('true');
    expect(form.get('string')).toBe('hello');
    expect(form.get('float')).toBe('2.1');
  });

  test('Appends file as is', () => {
    const file = new File([''], 'file.txt');
    const form = htmlFormatter({ file });

    expect(form.get('file')).toEqual(file);
  });

  test('Does not join array values', () => {
    const data = {
      array: [1, 2],
    };
    const form = htmlFormatter(data);

    expect(form.getAll('array')).toEqual(['1', '2']);
  });

  test('Converts json values to escaped string', () => {
    const data = {
      json: {
        a: 1,
      },
      jsonArray: [{ a: 1 }, { b: 2 }],
    };
    const form = htmlFormatter(data);

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

  test('Appends file as is', () => {
    const file = new File([''], 'file.txt');
    const form = joinFormatter({ file });

    expect(form.get('file')).toEqual(file);
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

describe('pathFormatter', () => {
  test('Handles basic data', () => {
    const data = {
      number: 1,
      boolean: true,
      string: 'hello',
      float: 2.1,
    };
    const form = pathFormatter(data);

    expect(form.get('number')).toBe('1');
    expect(form.get('boolean')).toBe('true');
    expect(form.get('string')).toBe('hello');
    expect(form.get('float')).toBe('2.1');
  });

  test('Appends file as is', () => {
    const file = new File([''], 'file.txt');
    const form = pathFormatter({ file });

    expect(form.get('file')).toEqual(file);
  });

  test('Adds path index to key', () => {
    const data = {
      array: [1, 2],
    };
    const form = pathFormatter(data);

    expect(form.get('array[0]')).toBe('1');
    expect(form.get('array[1]')).toBe('2');
  });

  test('Does not stringify json', () => {
    const data = {
      json: {
        a: 1,
      },
      jsonArray: [{ a: 1 }, { b: 2 }],
    };
    const form = pathFormatter(data);

    expect(form.get('json.a')).toBe('1');
    expect(form.get('jsonArray[0].a')).toBe('1');
    expect(form.get('jsonArray[1].b')).toBe('2');
  });
});
