import { OwnedRequest } from './request';
import {
  ClientOptions,
  DeletePaths,
  Fetcher,
  GetPaths,
  Method,
  OwnedRequestState,
  PatchPaths,
  PostPaths,
  PutPaths,
} from './types';

export class Client<OpenAPIPaths> {
  private options: ClientOptions;
  private wrappedFetch: (url: string, init: RequestInit) => ReturnType<Fetcher>;
  constructor(options: ClientOptions) {
    this.options = options;
    this.wrappedFetch = this.createWrappedFetch();
  }

  /**
   *  Override default ClientOptions configuration
   * @param options {ClientOptions}
   */
  with(options: Partial<ClientOptions>) {
    return new Client<OpenAPIPaths>({
      ...this.options,
      ...options,
      headers: {
        ...this.options.headers,
        ...options.headers,
      },
      middlewares: [
        ...(this.options.middlewares || []),
        ...(options.middlewares || []),
      ],
    });
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
        middlewareHandler(nextUrl, nextInit!, index + 1)
      );
    };

    return middlewareHandler;
  }

  private send<Path extends keyof OpenAPIPaths>(
    method: Method,
    _path: Path,
    state: OwnedRequestState
  ) {
    let path = _path as string;
    for (const [key, value] of Object.entries(state._pathParams)) {
      path = path.replace(`{${key}}`, value.toString());
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(state._queryParams)) {
      if (Array.isArray(value)) {
        for (let item in value) {
          searchParams.append(key, item);
        }
        continue;
      }

      searchParams.append(key, value);
    }
    if (searchParams.size > 0) {
      path += `?${searchParams.toString()}`;
    }

    const baseUrl = new URL(this.options.baseUrl);
    const combinedPath = (baseUrl.pathname + path).replace('//', '/');

    const url = new URL(combinedPath, this.options.baseUrl).toString();
    const init: RequestInit = {
      method: method,
      body: Object.keys(state._body).length === 0 ? undefined : state._body,
      headers: {
        ...this.options.headers,
        ...state._headers,
      },
    };

    return this.wrappedFetch(url.toString(), init) as Promise<any>;
  }

  get<PathString extends keyof GetPaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<GetPaths<OpenAPIPaths>[PathString]>(
      this.send.bind(this, 'GET', path)
    );
    return ownedRequest.__withDynamicTyping();
  }
  post<PathString extends keyof PostPaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<PostPaths<OpenAPIPaths>[PathString]>(
      this.send.bind(this, 'POST', path)
    );
    return ownedRequest.__withDynamicTyping();
  }
  put<PathString extends keyof PutPaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<PutPaths<OpenAPIPaths>[PathString]>(
      this.send.bind(this, 'PUT', path)
    );
    return ownedRequest.__withDynamicTyping();
  }
  delete<PathString extends keyof DeletePaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<
      DeletePaths<OpenAPIPaths>[PathString]
    >(this.send.bind(this, 'DELETE', path));
    return ownedRequest.__withDynamicTyping();
  }
  patch<PathString extends keyof PatchPaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<PatchPaths<OpenAPIPaths>[PathString]>(
      this.send.bind(this, 'PATCH', path)
    );
    return ownedRequest.__withDynamicTyping();
  }
}
