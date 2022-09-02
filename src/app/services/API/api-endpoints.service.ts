// Angular Modules
import { Injectable } from '@angular/core';
import { QueryStringParameters } from './query-string-parameters';
import { UrlBuilder } from './url-builder';
import { environment } from '../../../environments/environment';
// Application Classes

@Injectable()
export class ApiEndpointsService {
  constructor() {}

  // URL
  private createUrl(action: string): string {
    const urlBuilder: UrlBuilder = new UrlBuilder(environment.endpoint, action);
    return urlBuilder.toString();
  }

  // URL WITH QUERY PARAMS
  private createUrlWithQueryParameters(
    action: string,
    queryStringHandler?: (queryStringParameters: QueryStringParameters) => void
  ): string {
    const urlBuilder: UrlBuilder = new UrlBuilder(environment.endpoint, action);
    // Push extra query string params
    if (queryStringHandler) {
      queryStringHandler(urlBuilder.queryString);
    }
    return urlBuilder.toString();
  }

  // URL WITH PATH VARIABLES
  private createUrlWithPathVariables(action: string, pathVariables: any[] = []): string {
    let encodedPathVariablesUrl: string = '';
    // Push extra path variables
    for (const pathVariable of pathVariables) {
      if (pathVariable !== null) {
        encodedPathVariablesUrl += `/${encodeURIComponent(pathVariable.toString())}`;
      }
    }
    const urlBuilder: UrlBuilder = new UrlBuilder(environment.endpoint, `${action}${encodedPathVariablesUrl}`);
    return urlBuilder.toString();
  }

  public getTileSets() {
    return this.createUrl('gameboard/tileset/');
  }
}
