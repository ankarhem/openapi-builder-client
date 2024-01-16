import type { paths } from '../openapi/petstore';
import { Client } from '../src';
import { htmlFormatter } from '../src/search';

export const mockedClient = new Client<paths>({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  fetcher: async (url, init) => new Response(),
  formFormatter: htmlFormatter,
});
