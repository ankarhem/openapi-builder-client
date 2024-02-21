import { describe, expect, test } from 'bun:test';
import { mockedClient } from './utils';
import { joinFormatter } from '../src/formatters';

const client = mockedClient.with({
  fetcher: fetch,
  // fetcher: debugFetcher,
  formFormatter: joinFormatter,
  headers: {
    Accept: 'application/json',
  },
});

const PET = {
  id: 10,
  name: 'doggie',
  category: {
    id: 1,
    name: 'Dogs',
  },
  photoUrls: ['string'],
  tags: [
    {
      id: 0,
      name: 'string',
    },
  ],
  status: 'available' as const,
};

describe('Basic requests', () => {
  test('POST', async () => {
    const response = await client.post('/pet').body(PET).send();
    expect(response.ok).toBeTrue();

    if (response.ok) {
      const data = await response.json();
      expect(data.name).toBe('doggie');
    }
  });
  test('GET', async () => {
    const response = await client
      .get('/pet/{petId}')
      .path({ petId: 10 })
      .send();
    expect(response.ok).toBeTrue();
  });
  test('PUT', async () => {
    const response = await client.put('/pet').body(PET).send();

    expect(response.ok).toBeTrue();

    if (response.ok) {
      const data = await response.json();
      expect(data.name).toBe('doggie');
    }
  });
  test('DELETE', async () => {
    const response = await client
      .delete('/pet/{petId}')
      .path({ petId: 10 })
      .headers({
        api_key: '123',
      })
      .send();

    expect(response.ok).toBeTrue();
  });
});
