import {
  IsEmptyObject,
  IsNever,
  IsUnknown,
  HasRequiredKeys,
  ValueOf,
  RequiredKeysOf,
  IfNever,
} from 'type-fest';
import {
  BodyOf,
  PathParamsOf,
  QueryParamsOf,
  ResponseOf,
  TestPathsPost,
} from './types';

type ShouldDiscard<T> = IsEmptyObject<T> | IsNever<T> | IsUnknown<T>;

type MethodsToFilter<Path> =
  | 'send'
  | '__withDynamicTyping'
  | (true extends ShouldDiscard<PathParamsOf<Path>> ? 'path' : never)
  | (true extends ShouldDiscard<QueryParamsOf<Path>> ? 'query' : never)
  | (true extends ShouldDiscard<BodyOf<Path>> ? 'body' : never);

type MethodsRemaining<Path, UsedMethods extends string> = Exclude<
  keyof OwnedRequest<Path, UsedMethods>,
  MethodsToFilter<Path> | UsedMethods | `__${UsedMethods}`
>;

type OptionalMethods<Path> =
  | IfNever<RequiredKeysOf<Required<PathParamsOf<Path>>>, 'path', never>
  | IfNever<RequiredKeysOf<Required<QueryParamsOf<Path>>>, 'query', never>
  | IfNever<RequiredKeysOf<Required<BodyOf<Path>>>, 'body', never>;

type NextOwnedRequest<Path, UsedMethods extends string> = Exclude<
  MethodsRemaining<Path, UsedMethods>,
  `__${string}` | OptionalMethods<Path>
> extends never
  ? Pick<
      OwnedRequest<Path, UsedMethods>,
      MethodsRemaining<Path, UsedMethods> | 'send'
    >
  : Pick<OwnedRequest<Path, UsedMethods>, MethodsRemaining<Path, UsedMethods>>;

interface OwnedRequestState {
  _pathParams: Record<string, any>;
  _queryParams: Record<string, any>;
  _body: any;
}

class OwnedRequest<Path, UsedMethods extends string = ''> {
  private _pathParams: Record<string, any> = {};
  private _queryParams: Record<string, any> = {};
  private _body: any;

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

  __path(params: Record<string, any>) {
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

  __body(body: any) {
    if (body) {
      this._body = body;
    }
    return this as NextOwnedRequest<Path, UsedMethods | 'body'>;
  }

  send() {
    return this._send({
      _pathParams: this._pathParams,
      _queryParams: this._queryParams,
      _body: this._body,
    });
  }
}

const request = new OwnedRequest<TestPathsPost['/pet/{petId}']>(
  ({}) => fetch('/') as any
);
