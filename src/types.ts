import {
  ConditionalExcept,
  Get,
  IfNever,
  IsEmptyObject,
  IsNever,
  IsUnknown,
  RequiredKeysOf,
  Simplify,
  ValueOf,
} from 'type-fest';
import { OwnedRequest } from './request';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/** OpenAPI Helpers */
type OmitNever<T> = ConditionalExcept<T, never>;

export type GetPaths<OpenAPIPaths> = OmitNever<{
  [Path in keyof OpenAPIPaths]: Extract<
    OpenAPIPaths[Path],
    { get: any }
  >['get'];
}>;
export type PostPaths<OpenAPIPaths> = OmitNever<{
  [Path in keyof OpenAPIPaths]: Extract<
    OpenAPIPaths[Path],
    { post: any }
  >['post'];
}>;
export type PutPaths<OpenAPIPaths> = OmitNever<{
  [Path in keyof OpenAPIPaths]: Extract<
    OpenAPIPaths[Path],
    { put: any }
  >['put'];
}>;
export type DeletePaths<OpenAPIPaths> = OmitNever<{
  [Path in keyof OpenAPIPaths]: Extract<
    OpenAPIPaths[Path],
    { delete: any }
  >['delete'];
}>;
export type PatchPaths<OpenAPIPaths> = OmitNever<{
  [Path in keyof OpenAPIPaths]: Extract<
    OpenAPIPaths[Path],
    { patch: any }
  >['patch'];
}>;

export type ResponseOf<Path> = Simplify<
  {
    [Code in keyof Get<Path, 'responses'>]: Omit<
      Response,
      'status' | 'json'
    > & {
      status: Code;
      json(): Promise<
        Get<Get<Path, 'responses'>[Code], 'content.application/json'>
      >;
    };
  }[keyof Get<Path, 'responses'>]
>;

export type PathParamsOf<Path> = Get<Path, 'parameters.path'>;
export type QueryParamsOf<Path> = Get<Path, 'parameters.query'>;
export type HeaderParamsOf<Path> = Get<Path, 'parameters.header'>;

export type JsonBodyOf<Path> = Get<
  Path,
  'requestBody.content.application/json'
>;
export type FormDataOf<Path> = Get<
  Path,
  'requestBody.content.application/x-www-form-urlencoded'
>;

/** Client */
export interface Fetcher {
  (url: string, init: RequestInit): Promise<Response>;
}

export type FormBodyFormatter = (body: Record<string, any>) => FormData;

export type ClientOptions = {
  baseUrl: string;
  headers?: Record<string, string>;
  fetcher: Fetcher;
  middlewares?: MiddlewareFunction[];
  retries?: number;
  formBodyFormatter?: FormBodyFormatter;
};

export type MiddlewareFunction = (
  url: string,
  init: RequestInit,
  next: Fetcher
) => ReturnType<Fetcher>;

/** Request */
type ShouldDiscard<T> = IsEmptyObject<T> | IsNever<T> | IsUnknown<T>;

type MethodsToFilter<Path> =
  | 'send'
  | '__withDynamicTyping'
  | (true extends ShouldDiscard<PathParamsOf<Path>> ? 'path' : never)
  | (true extends ShouldDiscard<QueryParamsOf<Path>> ? 'query' : never)
  | (true extends ShouldDiscard<HeaderParamsOf<Path>> ? 'headers' : never)
  | (true extends ShouldDiscard<JsonBodyOf<Path>> ? 'body' : never)
  | (true extends ShouldDiscard<FormDataOf<Path>> ? 'form' : never);

type MethodsRemaining<Path, UsedMethods extends string> = Exclude<
  keyof OwnedRequest<Path, UsedMethods>,
  MethodsToFilter<Path> | UsedMethods | `__${UsedMethods}`
>;

type OptionalMethods<Path> =
  | IfNever<RequiredKeysOf<Required<PathParamsOf<Path>>>, 'path', never>
  | IfNever<RequiredKeysOf<Required<QueryParamsOf<Path>>>, 'query', never>
  | IfNever<RequiredKeysOf<Required<HeaderParamsOf<Path>>>, 'headers', never>
  | IfNever<RequiredKeysOf<Required<JsonBodyOf<Path>>>, 'body', never>
  | IfNever<RequiredKeysOf<Required<FormDataOf<Path>>>, 'form', never>;

export type NextOwnedRequest<Path, UsedMethods extends string> = Exclude<
  MethodsRemaining<Path, UsedMethods>,
  `__${string}` | OptionalMethods<Path>
> extends never
  ? Pick<
      OwnedRequest<Path, UsedMethods>,
      MethodsRemaining<Path, UsedMethods> | 'send'
    >
  : Pick<OwnedRequest<Path, UsedMethods>, MethodsRemaining<Path, UsedMethods>>;

export interface OwnedRequestState {
  path: Record<string, string | number>;
  query: Record<string, string | readonly string[]>;
  headers: Record<string, string | readonly string[]>;
  body: RequestInit['body'];
}
