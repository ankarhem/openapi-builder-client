import type { paths } from '../openapi/petstore';
import { Client } from '../src';
import { test } from 'bun:test';
import { mockedClient } from './utils';

test('Exposes all override methods by default', () => {
  mockedClient
    .get('/pet/{petId}')
    .__path({})
    .__query({})
    .__headers({})
    .__body({});
});

test('Using a method removes method and override method', () => {
  const request = mockedClient.get('/pet/{petId}').path({ petId: 1 });

  // @ts-expect-error
  request.__path({});
  // @ts-expect-error
  request.path({ petId: 1 });
  request.__body({}).__headers({}).__query({});
});
test('Using an override method removes method and override method', () => {
  const request = mockedClient.get('/pet/{petId}').__path({ petId: 1 });

  // @ts-expect-error
  request.__path({});
  // @ts-expect-error
  request.path({ petId: 1 });
  request.__body({}).__headers({}).__query({});
});

test('Send only visible when all required methods used', () => {
  const request = mockedClient.get('/pet/{petId}');

  // @ts-expect-error
  request.send();

  request.path({ petId: 1 }).send();
});
