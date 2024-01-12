import type { paths } from '../openapi/petstore';
import { Client } from '../src';
import { expect, test } from 'bun:test';

const client = new Client<paths>({
  baseUrl: '',
  fetcher: fetch,
});

test('Exposes all override methods by default', () => {
  client.get('/pet/{petId}').__path({}).__query({}).__headers({}).__body({});
});

test('Using a method removes override method', () => {
  const request = client.get('/pet/{petId}').path({ petId: 1 });

  // @ts-expect-error
  request.__path({});
  request.__body({}).__headers({}).__query({});
});
