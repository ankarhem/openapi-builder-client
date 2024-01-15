import { ClientOptions, Fetcher } from '.';

export class OwnedFetcher {
  private options: ClientOptions;
  private wrappedFetcher: Fetcher;
  constructor(options: ClientOptions) {
    this.options = options;
    this.wrappedFetcher = this.createWrappedFetch();
  }

  private createWrappedFetch(): (
    url: string,
    init: RequestInit
  ) => Promise<Response> {
    if (!this.options.middlewares) return this.options.fetcher;

    const fetchWithRetries = (
      url: string,
      init: RequestInit,
      retries: number = 0
    ): ReturnType<Fetcher> => {
      try {
        return this.options.fetcher(url, init);
      } catch (error) {
        if (retries < (this.options.retries || 0)) {
          return fetchWithRetries(url, init, retries + 1);
        }
        throw error;
      }
    };

    const middlewareHandler = async (
      url: string,
      init: RequestInit,
      index: number = 0
    ): ReturnType<Fetcher> => {
      if (
        !this.options.middlewares ||
        index === this.options.middlewares.length
      ) {
        return fetchWithRetries(url, init);
      }
      const current = this.options.middlewares?.[index];
      return await current(url, init, (nextUrl, nextInit) =>
        middlewareHandler(nextUrl, nextInit, index + 1)
      );
    };

    return middlewareHandler;
  }

  send(url: string, init: RequestInit) {
    return this.wrappedFetcher(url, init);
  }
}
