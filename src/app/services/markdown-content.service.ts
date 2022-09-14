import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { APIResponse } from '../model/APIResponse';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum SourceDirectory {
  NEWS = 'news/',
  UPDATES = 'updates/',
}

@Injectable({
  providedIn: 'root',
})
export class MarkdownContentService {
  private readonly baseUrl = environment.endpoint;

  headlineCache: BehaviorSubject<[string, string][]> = new BehaviorSubject<[string, string][]>([]);

  constructor(private httpClient: HttpClient) {
    const addHeadlineToCache = (suc: [string, string][]) => {
      const acc: [string, string][] = this.headlineCache.value || [];
      suc.map((pair: [string, string]) => {
        acc[pair[0]] = pair[1];
      });
      this.headlineCache.next(acc);
    };

    this.getHeadlineMapping(SourceDirectory.NEWS).subscribe(addHeadlineToCache);
    this.getHeadlineMapping(SourceDirectory.UPDATES).subscribe(addHeadlineToCache);
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
