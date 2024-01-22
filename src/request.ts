import {
  JsonBodyOf,
  HeaderParamsOf,
  NextOwnedRequest,
  OwnedRequestState,
  PathParamsOf,
  QueryParamsOf,
  ResponseOf,
  FormDataOf,
} from './types';

type BodyMethods = 'body' | 'form';

export class OwnedRequest<Path, UsedMethods extends string = ''> {
  private state: OwnedRequestState = {
    path: {},
    query: {},
    headers: {},
    body: undefined,
    extras: undefined,
  };

  private _send: (state: OwnedRequestState) => Promise<ResponseOf<Path>>;

  constructor(send: (state: OwnedRequestState) => Promise<ResponseOf<Path>>) {
    this._send = send;
    return this;
  }

  __withDynamicTyping() {
    return this as NextOwnedRequest<Path, UsedMethods>;
  }

  path(
    params: PathParamsOf<Path>
  ): NextOwnedRequest<Path, UsedMethods | 'path'> {
    if (params) {
      this.state.path = params;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'path'>;
  }
  __path(params: Record<string, string | number>) {
    return this.path(params as any);
  }

  query(params: QueryParamsOf<Path>) {
    if (params) {
      this.state.query = params;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'query'>;
  }
  __query(params: Record<string, any>) {
    return this.query(params as any);
  }

  body(body: JsonBodyOf<Path>) {
    if (body) {
      this.state.body = body;
      this.state.headers['Content-Type'] = 'application/json';
    }
    return this as NextOwnedRequest<Path, UsedMethods | BodyMethods>;
  }
  __body(body: Record<string, any>) {
    return this.body(body as any);
  }

  form(data: FormDataOf<Path>) {
    if (data) {
      this.state.body = data;
      this.state.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return this as NextOwnedRequest<Path, UsedMethods | BodyMethods>;
  }
  __form(data: Record<string, any>) {
    return this.form(data as any);
  }

  headers(headers: HeaderParamsOf<Path>) {
    if (headers) {
      this.state.headers = {
        ...this.state.headers,
        ...headers,
      };
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'headers'>;
  }
  __headers(headers: Record<string, string>) {
    return this.headers(headers as any);
  }

  send(extras?: Pick<RequestInit, 'signal'>) {
    this.state.extras = extras;
    return this._send(this.state);
  }
}
