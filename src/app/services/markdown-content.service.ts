import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { APIResponse } from '../model/APIResponse';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum SourceDirectory {
  NEWS = 'api/news/',
}

@Injectable({
  providedIn: 'root',
})
export class MarkdownContentService {
  private readonly prodBaseUrl = 'https://tispyl.uber.space:41920/';
  private readonly devBaseUrl = 'http://localhost:25670/';
  private readonly baseUrl = environment.production ? this.prodBaseUrl : this.devBaseUrl;

  headlineCache: BehaviorSubject<[string, string][]> = new BehaviorSubject<[string, string][]>(undefined);

  constructor(private httpClient: HttpClient) {
    this.getHeadlineMapping(SourceDirectory.NEWS).subscribe((suc: [string, string][]) => {
      const acc: [string, string][] = [];
      suc.map((pair: [string, string]) => {
        acc[pair[0]] = pair[1];
      });
      this.headlineCache.next(acc);
    });
  }

  getAvailableContent(dir: SourceDirectory): Observable<string[]> {
    return this.httpClient.get<APIResponse<string[]>>(this.baseUrl + dir).pipe(
      map((res: APIResponse<string[]>) => {
        return res.payload;
      })
    );
  }

  getMarkdownFor(dir: SourceDirectory, fileName: string): Observable<string> {
    return this.httpClient.get(this.baseUrl + dir + fileName, { responseType: 'text' });
  }

  getHeadFor(dir: SourceDirectory, fileName: string): Observable<string> {
    return this.httpClient.get<APIResponse<string>>(this.baseUrl + dir + fileName + '/head').pipe(
      map((res: APIResponse<string>) => {
        return res.payload;
      })
    );
  }

  getHeadlineMapping(dir: SourceDirectory): Observable<[string, string][]> {
    return this.httpClient.get<APIResponse<[string, string][]>>(this.baseUrl + dir + '/headmapping').pipe(
      map((res: APIResponse<[string, string][]>) => {
        return res.payload;
      })
    );
  }
}
