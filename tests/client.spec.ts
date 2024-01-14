import type { paths } from '../openapi/petstore';
import { Client } from '../src';
import { expect, test } from 'bun:test';

const client = new Client<paths>({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  fetcher: fetch,
  headers: {
    'x-hello': 'world',
  },
});

test('Can send get', async () => {
  const response = await client
    .get('/pet/{petId}')
    .path({
      petId: 1,
    })
    .send();

  expect(response.status).toBe(200);
  expect((await response.json()).id).toBe(1);
});
