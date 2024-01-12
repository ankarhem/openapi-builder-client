import {
  BodyOf,
  HeaderParamsOf,
  NextOwnedRequest,
  OwnedRequestState,
  PathParamsOf,
  QueryParamsOf,
  ResponseOf,
} from './types';

export class OwnedRequest<Path, UsedMethods extends string = ''> {
  private _pathParams: Record<string, string | number> = {};
  private _queryParams: Record<string, any> = {};
  private _headers: Record<string, string> = {};
  private _body: Record<string, any> = {};

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
      this._pathParams = params;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'path'>;
  }

  __path(params: Record<string, string | number>) {
    this._pathParams = params;
    return this as NextOwnedRequest<Path, UsedMethods | 'path'>;
  }

  query(params: QueryParamsOf<Path>) {
    if (params) {
      this._queryParams = params;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'query'>;
  }

  __query(params: Record<string, any>) {
    this._queryParams = params;
    return this as NextOwnedRequest<Path, UsedMethods | 'query'>;
  }

  body(body: BodyOf<Path>) {
    if (body) {
      this._body = body;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'body'>;
  }

  __body(body: Record<string, any>) {
    if (body) {
      this._body = body;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'body'>;
  }

  headers(headers: HeaderParamsOf<Path>) {
    if (headers) {
      this._headers = headers;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'headers'>;
  }

  __headers(headers: Record<string, string>) {
    if (headers) {
      this._headers = headers;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'headers'>;
  }

  send() {
    return this._send({
      _pathParams: this._pathParams,
      _queryParams: this._queryParams,
      _body: this._body,
      _headers: this._headers,
    });
  }
}
