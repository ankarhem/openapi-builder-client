import { OwnedRequest } from './request';
import {
  ClientOptions,
  DeletePaths,
  GetPaths,
  OwnedRequestState,
  PatchPaths,
  PostPaths,
  PutPaths,
  ResponseOf,
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
      headers: state._headers,
    });
  }

  get<PathString extends keyof GetPaths<OpenAPIPaths>>(path: PathString) {
    const boundSend: any = (state: OwnedRequestState) => {
      return this.send(path, state) as Promise<
        ResponseOf<PostPaths<PathString>>
      >;
    };
    const ownedRequest = new OwnedRequest<GetPaths<OpenAPIPaths>[PathString]>(
      boundSend
    );
    return ownedRequest.__withDynamicTyping();
  }
  post<PathString extends keyof PostPaths<OpenAPIPaths>>(path: PathString) {
    const boundSend = (state: OwnedRequestState) => {
      return this.send(path, state) as Promise<
        ResponseOf<PostPaths<PathString>>
      >;
    };
    const ownedRequest = new OwnedRequest<PostPaths<OpenAPIPaths>[PathString]>(
      boundSend
    );
    return ownedRequest.__withDynamicTyping();
  }
  put<PathString extends keyof PutPaths<OpenAPIPaths>>(path: PathString) {
    const boundSend = (state: OwnedRequestState) => {
      return this.send(path, state) as Promise<
        ResponseOf<PostPaths<PathString>>
      >;
    };
    const ownedRequest = new OwnedRequest<PutPaths<OpenAPIPaths>[PathString]>(
      boundSend
    );
    return ownedRequest.__withDynamicTyping();
  }
  delete<PathString extends keyof DeletePaths<OpenAPIPaths>>(path: PathString) {
    const boundSend = (state: OwnedRequestState) => {
      return this.send(path, state) as Promise<
        ResponseOf<PostPaths<PathString>>
      >;
    };
    const ownedRequest = new OwnedRequest<
      DeletePaths<OpenAPIPaths>[PathString]
    >(boundSend);
    return ownedRequest.__withDynamicTyping();
  }
  patch<PathString extends keyof PatchPaths<OpenAPIPaths>>(path: PathString) {
    const boundSend = (state: OwnedRequestState) => {
      return this.send(path, state) as Promise<
        ResponseOf<PostPaths<PathString>>
      >;
    };
    const ownedRequest = new OwnedRequest<PatchPaths<OpenAPIPaths>[PathString]>(
      boundSend
    );
    return ownedRequest.__withDynamicTyping();
  }
}
