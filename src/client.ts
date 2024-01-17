import { SetRequired } from 'type-fest';
import { OwnedFetcher } from './fetcher';
import { OwnedRequest } from './request';
import {
  ClientOptions,
  DeletePaths,
  GetPaths,
  Method,
  OwnedRequestState,
  PatchPaths,
  PostPaths,
  PutPaths,
} from './types';

export class Client<OpenAPIPaths> {
  private options: SetRequired<
    ClientOptions,
    'formFormatter' | 'retries' | 'middlewares'
  >;
  private ownedFetcher: OwnedFetcher;
  constructor(options: ClientOptions) {
    this.options = {
      retries: 0,
      middlewares: [],
      ...options,
    };
    this.ownedFetcher = new OwnedFetcher({
      fetcher: this.options.fetcher,
      condition: this.options.condition,
    })
      .withRetries(this.options.retries)
      .withMiddlewares(this.options.middlewares);
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

  private send<Path extends keyof OpenAPIPaths>(
    method: Method,
    _path: Path,
    state: OwnedRequestState
  ) {
    let path = _path as string;
    for (const [key, value] of Object.entries(state.path)) {
      path = path.replace(`{${key}}`, value.toString());
    }

    const searchParams = new URLSearchParams(
      this.options.formFormatter(state.query) as any
    );
    if (searchParams.size > 0) {
      path += `?${searchParams.toString()}`;
    }

    const baseUrl = new URL(this.options.baseUrl);
    const combinedPath = (baseUrl.pathname + path).replace('//', '/');

    const url = new URL(combinedPath, this.options.baseUrl).toString();

    const init: RequestInit = {
      method: method,
      body: this.encodeBody(state),
      headers: {
        ...this.options.headers,
        ...state.headers,
      },
    };

    return this.ownedFetcher.send(url.toString(), init) as Promise<any>;
  }

  private encodeBody(state: OwnedRequestState): RequestInit['body'] {
    if (!state.body) return undefined;

    switch (state.headers['Content-Type']) {
      case 'multipart/form-data':
        return this.options.formFormatter(state.body);
      case 'application/x-www-form-urlencoded':
        return new URLSearchParams(
          this.options.formFormatter(state.body) as any
        );
      case 'application/json':
      default:
        return JSON.stringify(state.body);
    }
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
