import { OwnedRequest } from './request';
import {
  ClientOptions,
  DeletePaths,
  GetPaths,
  OwnedRequestState,
  PatchPaths,
  PostPaths,
  PutPaths,
} from './types';

export class Client<OpenAPIPaths> {
  private options: ClientOptions;
  constructor(options: ClientOptions) {
    this.options = options;
  }

  /**
   *  Override default ClientOptions configuration
   * @param options {ClientOptions}
   */
  with(options: Partial<ClientOptions>) {
    return new Client<OpenAPIPaths>({
      ...this.options,
      ...options,
    });
  }

  private send<Path extends keyof OpenAPIPaths>(
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

    const url = new URL(path, this.options.baseUrl);
    return this.options.fetcher(url.toString(), {
      body: Object.keys(state._body).length === 0 ? undefined : state._body,
      headers: {
        ...this.options.headers,
        ...state._headers,
      },
    }) as Promise<any>;
  }

  get<PathString extends keyof GetPaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<GetPaths<OpenAPIPaths>[PathString]>(
      this.send.bind(this, path)
    );
    return ownedRequest.__withDynamicTyping();
  }
  post<PathString extends keyof PostPaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<PostPaths<OpenAPIPaths>[PathString]>(
      this.send.bind(this, path)
    );
    return ownedRequest.__withDynamicTyping();
  }
  put<PathString extends keyof PutPaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<PutPaths<OpenAPIPaths>[PathString]>(
      this.send.bind(this, path)
    );
    return ownedRequest.__withDynamicTyping();
  }
  delete<PathString extends keyof DeletePaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<
      DeletePaths<OpenAPIPaths>[PathString]
    >(this.send.bind(this, path));
    return ownedRequest.__withDynamicTyping();
  }
  patch<PathString extends keyof PatchPaths<OpenAPIPaths>>(path: PathString) {
    const ownedRequest = new OwnedRequest<PatchPaths<OpenAPIPaths>[PathString]>(
      this.send.bind(this, path)
    );
    return ownedRequest.__withDynamicTyping();
  }
}
