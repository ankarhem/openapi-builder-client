import {
  EmptyObject,
  Simplify,
  IsEmptyObject,
  IsNever,
  IsUnknown,
} from 'type-fest';
import {
  BodyOf,
  PathParamsOf,
  QueryParamsOf,
  ResponseOf,
  TestPathsGet,
  TestPathsPost,
} from './types';

type OverrideMethods<Path, MethodsUsed extends string> = {
  __path(
    params: Record<string, any>
  ): NextOwnedRequest<Path, MethodsUsed | 'path'>;
  __query(
    params: Record<string, any>
  ): NextOwnedRequest<Path, MethodsUsed | 'query'>;
  __body(
    params: Record<string, any>
  ): NextOwnedRequest<Path, MethodsUsed | 'body'>;
};

type ShouldDiscard<T> = IsEmptyObject<T> | IsNever<T> | IsUnknown<T>;

type RequestPathParamsMissing<
  Path,
  MethodsUsed extends string
> = true extends ShouldDiscard<PathParamsOf<Path>>
  ? Pick<OverrideMethods<Path, MethodsUsed>, '__path'>
  : {
      path(params: PathParamsOf<Path>): any;
    };

type RequestQueryParamsMissing<
  Path,
  MethodsUsed extends string
> = true extends ShouldDiscard<QueryParamsOf<Path>>
  ? Pick<OverrideMethods<Path, MethodsUsed>, '__query'>
  : {
      query(params: QueryParamsOf<Path>): any;
    };

type RequestBodyMissing<
  Path,
  MethodsUsed extends string
> = true extends ShouldDiscard<BodyOf<Path>>
  ? Pick<OverrideMethods<Path, MethodsUsed>, '__body'>
  : {
      body(body: BodyOf<Path>): any;
    };

type RequestBuilt<Path> = {
  send(): Promise<ResponseOf<Path>>;
};

type OwnedRequestMethods<Path, MethodsUsed extends string> = Simplify<
  RequestPathParamsMissing<Path, MethodsUsed> &
    RequestQueryParamsMissing<Path, MethodsUsed> &
    RequestBodyMissing<Path, MethodsUsed>
>;

type NextOwnedRequest<Path, MethodsUsed extends string> = Omit<
  OwnedRequestMethods<Path, MethodsUsed>,
  MethodsUsed | `__${MethodsUsed}` | `__${string}`
> extends EmptyObject
  ? Omit<
      RequestBuilt<Path> & OverrideMethods<Path, MethodsUsed>,
      MethodsUsed | `__${MethodsUsed}`
    >
  : Omit<
      OwnedRequestMethods<Path, MethodsUsed>,
      MethodsUsed | `__${MethodsUsed}`
    >;

type PathTestTest = PathParamsOf<TestPathsPost['/pet']>;
type PathTest = RequestPathParamsMissing<TestPathsPost['/pet'], ''>;
type QueryTest = RequestQueryParamsMissing<TestPathsPost['/pet'], ''>;
type BodyTest = RequestBodyMissing<TestPathsPost['/pet'], ''>;

type TestOne = OwnedRequestMethods<TestPathsPost['/pet'], ''>;
type TestTwo = OwnedRequestMethods<TestPathsPost['/pet/{petId}'], ''>;

type TestNext = NextOwnedRequest<TestPathsPost['/pet/{petId}'], 'path'>;

type OwnedRequestState = {
  _pathParams: Record<string, any>;
  _queryParams: Record<string, any>;
  _body: any;
};

class OwnedRequest<Path, MethodsUsed extends string = ''> {
  private _pathParams: Record<string, any> = {};
  private _queryParams: Record<string, any> = {};
  private _body: any;
  private _send: () => Promise<ResponseOf<Path>>;

  constructor(send: () => Promise<any>) {
    this._send = send;
  }

  path(
    this: OwnedRequestMethods<Path, MethodsUsed> & OwnedRequestState,
    params: PathParamsOf<Path>
  ) {
    if (params) {
      this._pathParams = params;
    }
    return this as unknown as NextOwnedRequest<Path, MethodsUsed | 'path'> &
      OwnedRequestState;
  }

  __path(
    this: OwnedRequestMethods<Path, MethodsUsed> & OwnedRequestState,
    params: Record<string, any>
  ) {
    this._pathParams = params;
    return this as NextOwnedRequest<Path, MethodsUsed | 'path'> &
      OwnedRequestState;
  }

  query(
    this: OwnedRequestMethods<Path, MethodsUsed> & OwnedRequestState,
    params: QueryParamsOf<Path>
  ) {
    if (params) {
      this._queryParams = params;
    }
    return this as NextOwnedRequest<Path, MethodsUsed | 'query'> &
      OwnedRequestState;
  }

  __query(
    this: OwnedRequestMethods<Path, MethodsUsed> & OwnedRequestState,
    params: Record<string, any>
  ) {
    this._queryParams = params;
    return this as NextOwnedRequest<Path, MethodsUsed | 'query'> &
      OwnedRequestState;
  }

  body(
    this: OwnedRequestMethods<Path, MethodsUsed> & OwnedRequestState,
    body: BodyOf<Path>
  ) {
    if (body) {
      this._body = body;
    }
    return this as NextOwnedRequest<Path, MethodsUsed | 'body'> &
      OwnedRequestState;
  }

  __body(
    this: OwnedRequestMethods<Path, MethodsUsed> & OwnedRequestState,
    body: any
  ) {
    this._body = body;
    return this as NextOwnedRequest<Path, MethodsUsed | 'body'> &
      OwnedRequestState;
  }

  send() {
    return this._send();
  }
}

const request = new OwnedRequest<TestPathsPost['/pet/{petId}']>(() =>
  fetch('/')
);

const test = await request.path({ petId: 1 }).query({ name: '' }).send();
