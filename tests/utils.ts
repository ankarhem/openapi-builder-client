import type { paths } from '../openapi/petstore';
import { Client, Fetcher } from '../src';
import { htmlFormatter } from '../src/search';

export const fetcherWith200Response: Fetcher = async (url, init) =>
  new Response(undefined, { status: 200 });

export const mockedClient = new Client<paths>({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  fetcher: fetcherWith200Response,
  formFormatter: htmlFormatter,
});

export function debugFetcher(url: string, init: RequestInit) {
  console.log(url, init);
  return fetch(url, init).then((r) => {
    console.log(r);
    return r;
  });
}
