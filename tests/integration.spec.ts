import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { debugFetcher, invariant, mockedClient } from './utils';
import { joinFormatter } from '../src/formatters';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

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
  let container: StartedTestContainer;
  let client: typeof mockedClient;

  beforeAll(async () => {
    container = await new GenericContainer('swaggerapi/petstore:1.0.7')
      .withEnvironment({
        SWAGGER_HOST: 'http://petstore.swagger.io',
        SWAGGER_URL: 'http://localhost:8080',
      })
      .withExposedPorts(8080)
      .start();

    client = mockedClient.with({
      baseUrl: `http://${container.getHost()}:${container.getMappedPort(
        8080
      )}/api`,
      fetcher: fetch,
      // fetcher: debugFetcher,
      formFormatter: joinFormatter,
      headers: {
        Accept: 'application/json',
      },
    });
  }, 60_000);

  afterAll(async () => {
    await container.stop();
  });

  test('GET', async () => {
    const response = await client
      .get('/pet/{petId}')
      .path({ petId: PET.id })
      .send();

    invariant(response.ok);
    const data = await response.json();
    expect(data).toMatchSnapshot();
  });
  test('PUT', async () => {
    const response = await client.put('/pet').body(PET).send();

    invariant(response.ok);
    const data = await response.json();
    expect(data).toMatchSnapshot();
  });
  test('DELETE', async () => {
    const response = await client
      .delete('/pet/{petId}')
      .path({ petId: PET.id })
      .headers({
        api_key: '123',
      })
      .send();

    expect(response.ok).toBeTruthy();
  });
  test('POST', async () => {
    const response = await client.post('/pet').body(PET).send();
    invariant(response.ok);

    const data = await response.json();
    expect(data).toMatchSnapshot();
  });
});
