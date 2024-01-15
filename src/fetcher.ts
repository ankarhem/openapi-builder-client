import { Fetcher, MiddlewareFunction } from './types';

export class OwnedFetcher {
  private sender: Fetcher;
  constructor(fetcher: Fetcher) {
    this.sender = fetcher;
  }

  withRetries(retries: number = 0) {
    if (retries <= 0) return this;

    const fetchWithRetries = async (
      url: string,
      init: RequestInit,
      retryCount: number = 0
    ): ReturnType<Fetcher> => {
      try {
        return await this.send(url, init);
      } catch (error) {
        if (retryCount < (retries || 0)) {
          return await fetchWithRetries(url, init, retryCount + 1);
        }
        throw error;
      }
    };

    return new OwnedFetcher(fetchWithRetries);
  }

  withMiddlewares(middlewares: MiddlewareFunction[] = []) {
    if (middlewares.length === 0) return this;

    const fetchWithMiddlewares = (
      url: string,
      init: RequestInit,
      index: number = 0
    ): ReturnType<Fetcher> => {
      if (!middlewares || index === middlewares.length) {
        return this.sender(url, init);
      }
      const current = middlewares?.[index];
      return current(url, init, (nextUrl, nextInit) =>
        fetchWithMiddlewares(nextUrl, nextInit, index + 1)
      );
    };

    return new OwnedFetcher(fetchWithMiddlewares);
  }

  send(url: string, init: RequestInit) {
    return this.sender(url, init);
  }
}
