import { ConditionalExcept, Get, Simplify, ValueOf } from 'type-fest';
import { paths } from '../openapi/petstore';

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
      json(): Promise<ValueOf<Get<Get<Path, 'responses'>[Code], 'content'>>>;
    };
  }[keyof Get<Path, 'responses'>]
>;

export type QueryParamsOf<Path> = Get<Path, 'parameters.query'>;
export type PathParamsOf<Path> = Get<Path, 'parameters.path'>;
export type BodyOf<Path> = ValueOf<Get<Path, 'requestBody.content'>>;

export type TestPathsGet = GetPaths<paths>;
type TestResponse = ResponseOf<TestPathsGet['/pet/findByTags']>;

export type TestPathsPost = PostPaths<paths>;
type TestPathParams = PathParamsOf<TestPathsPost['/pet/{petId}']>;
type TestQueryParams = PathParamsOf<TestPathsPost['/pet/{petId}']>;
type TestBody = BodyOf<TestPathsPost['/pet/{petId}']>;

async function testing() {
  const r = '' as unknown as TestResponse;

  if (r.status === 400) {
    const data = await r.json();
  }

  const data = await r.json();
}
