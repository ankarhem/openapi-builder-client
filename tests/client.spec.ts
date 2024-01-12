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

test('Using a method removes method and override method', () => {
  const request = client.get('/pet/{petId}').path({ petId: 1 });

  // @ts-expect-error
  request.__path({});
  // @ts-expect-error
  request.path({ petId: 1 });
  request.__body({}).__headers({}).__query({});
});
test('Using an override method removes method and override method', () => {
  const request = client.get('/pet/{petId}').__path({ petId: 1 });

  // @ts-expect-error
  request.__path({});
  // @ts-expect-error
  request.path({ petId: 1 });
  request.__body({}).__headers({}).__query({});
});

test('Send only visible when all required methods used', () => {
  const request = client.get('/pet/{petId}');

  // @ts-expect-error
  request.send();

  request.path({ petId: 1 }).send();
});
