import { Injectable } from '@angular/core';
import { BasicUser } from './user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APIResponse } from '../model/APIResponse';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  readonly endpoint = environment.endpoint + 'profile';

  constructor(private httpClient: HttpClient) {}

  uploadProfilePicture(file: File, user: BasicUser): Observable<BasicUser> {
    return this.uploadProfilePictureByLoginName(file, user.login_name);
  }

  uploadProfilePictureByLoginName(file: File, login_name: string): Observable<BasicUser> {
    const formData: FormData = new FormData();
    formData.append('img', file, file.name);
    formData.append('login_name', login_name);

    return this.httpClient.post<APIResponse<BasicUser>>(this.endpoint, formData).pipe(map((apiResponse) => apiResponse.payload));
  }

  removeProfilePicture(user: BasicUser): Observable<void> {
    return this.httpClient
      .delete<APIResponse<void>>(this.endpoint + `?login_name=${user.login_name}`)
      .pipe(map((apiResponse) => apiResponse.payload));
  }

  profilePictureSource(name: string, forceUpdate = false): string {
    if (forceUpdate) {
      return this.endpoint + `?login_name=${name}&x_rng=${Math.random()}`;
    } else {
      return this.endpoint + `?login_name=${name}`;
    }
  }
}
