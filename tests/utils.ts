import type { paths } from '../openapi/petstore';
import { Client } from '../src';
import { htmlFormatter } from '../src/search';

export const mockedClient = new Client<paths>({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  fetcher: async (url, init) => new Response(),
  formFormatter: htmlFormatter,
});

export function debugFetcher(url: string, init: RequestInit) {
  console.log(url, init);
  return fetch(url, init).then((r) => {
    console.log(r);
    return r;
  });
}
