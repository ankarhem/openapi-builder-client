import type { SetRequired } from 'type-fest';
import type { Fetcher, FetcherOptions } from './types.js';

export class OwnedFetcher {
  private sender: Fetcher;
  private options: SetRequired<FetcherOptions, 'retries' | 'middlewares'>;

  constructor(options: FetcherOptions) {
    this.sender = options.fetcher;
    this.options = {
      retries: 0,
      middlewares: [],
      ...options,
    };

    return this.withRetries().withMiddlewares();
  }

  private withRetries = () => {
    if (this.options.retries <= 0) return this;

    const currentSender = this.sender;
    const fetchWithRetries = async (
      url: string,
      init: RequestInit,
      retryCount: number = 0
    ): ReturnType<Fetcher> => {
      const canRetry = Math.max(retryCount, 0) < this.options.retries;
      try {
        const response = await currentSender(url, init);
        if (
          typeof this.options.additionalRetryCondition === 'function' &&
          !this.options.additionalRetryCondition(response) &&
          canRetry
        ) {
          return await fetchWithRetries(url, init, retryCount + 1);
        }
        return response;
      } catch (error) {
        if (!canRetry) throw error;
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }

        return await fetchWithRetries(url, init, retryCount + 1);
      }
    };

    this.sender = fetchWithRetries;
    return this;
  };

  private withMiddlewares = () => {
    if (this.options.middlewares.length === 0) return this;

    const currentSender = this.sender;
    const fetchWithMiddlewares = (
      url: string,
      init: RequestInit,
      index: number = 0
    ): ReturnType<Fetcher> => {
      if (index === this.options.middlewares.length) {
        return currentSender(url, init);
      }
      const current = this.options.middlewares?.[index];
      return current(url, init, (nextUrl, nextInit) =>
        fetchWithMiddlewares(nextUrl, nextInit, index + 1)
      );
    };

    this.sender = fetchWithMiddlewares;
    return this;
  };

  send(url: string, init: RequestInit) {
    return this.sender(url, init);
  }
}
