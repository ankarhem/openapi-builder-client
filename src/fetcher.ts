import { Fetcher, FetcherOptions, MiddlewareFunction } from './types';

export class OwnedFetcher {
  private sender: Fetcher;
  private condition?: (response: Response) => boolean;

  constructor({ fetcher, condition }: FetcherOptions) {
    this.sender = fetcher;
    this.condition = condition;
  }

  withRetries(retries: number) {
    if (retries <= 0) return this;

    const fetchWithRetries = async (
      url: string,
      init: RequestInit,
      retryCount: number = 0
    ): ReturnType<Fetcher> => {
      const canRetry = Math.max(retryCount, 0) < (retries || 0);
      try {
        const response = await this.send(url, init);
        if (
          typeof this.condition === 'function' &&
          !this.condition(response) &&
          canRetry
        ) {
          return await fetchWithRetries(url, init, retryCount + 1);
        }
        return response;
      } catch (error) {
        if (canRetry) {
          return await fetchWithRetries(url, init, retryCount + 1);
        }
        throw error;
      }
    };

    return new OwnedFetcher({
      fetcher: fetchWithRetries,
      condition: this.condition,
    });
  }

  withMiddlewares(middlewares: MiddlewareFunction[]) {
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

    return new OwnedFetcher({
      fetcher: fetchWithMiddlewares,
      condition: this.condition,
    });
  }

  send(url: string, init: RequestInit) {
    return this.sender(url, init);
  }
}
