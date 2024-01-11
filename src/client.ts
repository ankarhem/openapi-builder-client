import { paths } from '../openapi/petstore';
import {
  DeletePaths,
  GetPaths,
  PatchPaths,
  PostPaths,
  PutPaths,
  ResponseOf,
} from './types';

export interface Fetcher {
  (url: string, requestInit?: RequestInit): Promise<Response>;
}

type ClientOptions = {
  fetcher: Fetcher;
};

class Client<OpenAPIPaths> {
  private fetcher: Fetcher;
  constructor({ fetcher }: ClientOptions) {
    this.fetcher = fetcher;
  }

  get<Path extends keyof GetPaths<OpenAPIPaths>>(
    path: Path
  ): ResponseOf<GetPaths<OpenAPIPaths>[Path]> {
    throw new Error('not implemented');
  }
  post<Path extends keyof PostPaths<OpenAPIPaths>>(
    path: Path
  ): ResponseOf<PostPaths<OpenAPIPaths>[Path]> {
    throw new Error('not implemented');
  }
}

const client = new Client<paths>({
  fetcher: fetch,
});

const response = client.get('/pet/{petId}');
const response2 = client.post('/pet/{petId}');
