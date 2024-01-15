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
  private _pathParams: OwnedRequestState['_pathParams'] = {};
  private _queryParams: OwnedRequestState['_queryParams'] = {};
  private _headers: OwnedRequestState['_headers'] = {};
  private _body: OwnedRequestState['_body'] = undefined;

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
    return this.path(params as any);
  }

  query(params: QueryParamsOf<Path>) {
    if (params) {
      this._queryParams = params;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'query'>;
  }

  __query(params: Record<string, any>) {
    return this.query(params as any);
  }

  body(body: BodyOf<Path>) {
    if (body) {
      this._body = JSON.stringify(body);
      this._headers['Content-Type'] = 'application/json';
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'body'>;
  }

  __body(body: Record<string, any>) {
    return this.body(body as any);
  }

  headers(headers: HeaderParamsOf<Path>) {
    if (headers) {
      this._headers = {
        ...this.__headers,
        ...headers,
      };
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'headers'>;
  }

  __headers(headers: Record<string, string>) {
    return this.headers(headers as any);
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
