# openapi-builder-client

Runtime has no dependencies and is small (`~1.3kb` minified gzipped).

### To Install

For types to work you need `typescript` and `type-fest`.

```bash
pnpm add openapi-builder-client
pnpm add -D typescript@^5.0.0 type-fest@^4.9.0
```

## Functionality

- [x] Typed
- [x] Overrideable config per request
- [x] Builder pattern
- [x] Middlewares
- [x] Configurable retries
- [x] JSON
- [x] Configurable form encoding

## Examples

Generate typescript types from an openapi spec
```bash
npx openapi-typescript https://petstore3.swagger.io/api/v3/openapi.json --output ./openapi/petstore.ts
```

Then create a client

```typescript
// client.ts
import { Client } from 'openapi-builder-client';
import { htmlFormatter } from 'openapi-builder-client/formatters';
import { paths } from './openapi/petstore.ts'

export const client = new Client<paths>({
  baseUrl: "https://petstore3.swagger.io/api/v3",
  /** 
   * Customize whether you want arrays to append values
   * (`?categories=cat&categories=dog`) or join values
   * (`?categories=cat,dog`) or construct paths
   * (`?categories[0]=cat&categories[1]=dog) etc.
   */
  formFormatter: htmlFormatter, 
  fetcher: fetch, // Bring your own fetcher
  /**
   * Customize retries in case fetcher rejects/throws
   */
  retries: 0,
  /**
   * Add additional retry condition.
   * Will not change reject/throwing behaviour.
   */
  additionalRetryCondition: (response) => response.status < 500,
  /**
   * Add middlewares to log or modify the requests
   */
  middlewares: [
    (url, init, next) => {
      const start = performance.now();
      return next(url, init).then((r) => {
        const end = performance.now();
        const pathname = new URL(url).pathname;
        console.log(`${init.method} to ${pathname} took ~${end - start}ms`);
        return r;
      });
    },
  ],
})
```

The client will dynamically provide different methods that you can use.
First you will need to set the request method using `get, post, put, delete or patch`.

Then, depending on what the request requires for a particular path,
you might need to use one or more of `path, query, form or body`

Finally when you've set the minimal required data, you will be able to use `send`, with converts the request into a promise.

```typescript
// anotherfile.ts
import {client} from './client.ts'

async function iFetchData() {
  const response = await client
    .get('/pet/{petId}') // Autocomplete paths
    .path({ petId: 1 }) // Autocompletes values needed
    .send(); // If everything is set, send will autocomplete

  // Will error because 400 and 404 response does not have json
  // @ts-expect-error
  const data = await response.json();

  if (response.ok) { // narrows json() type for statuses in ok range (200-299)
    const data = await response.json(); // works because status 200 - 299 have json
  }

  if (response.status === 200) { // autocomplete for status
    const data = await response.json(); // works because status 200 has json
  };
}
```

At any given time you can override the default client configuration.

```typescript
import { client } from './client.ts'

async function iFetchData() {
  const response = await client
    .with({
      /**
       * Override any of the original settings
       * used when creating your client
       */
      baseUrl: 'https://test.petstore.com',
      retries: 2,
    })
    .get('/pet/{petId}')
    .path({ petId: 1 })
    .send();
}
```

## Contribute

```bash
bun install
```

## Code Coverage

```bash
bun test
```

| File             | % Funcs | % Lines | Uncovered Line #s |
|------------------|---------|---------|-------------------|
| All files        |  96.46  |  99.62  |                   |
| src/client.ts    | 100.00  | 100.00  |                   |
| src/fetcher.ts   | 100.00  | 100.00  |                   |
| src/formatters.ts|  90.00  | 100.00  |                   |
| src/index.ts     | 100.00  | 100.00  |                   |
| src/request.ts   |  92.31  |  98.08  |                   |
