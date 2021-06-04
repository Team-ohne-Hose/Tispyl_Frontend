import { Injectable } from '@angular/core';
import { LoginUser, User } from './user.service';
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

  uploadProfilePicture(file: File, user: LoginUser): Observable<User> {
    const formData: FormData = new FormData();
    formData.append('img', file, file.name);
    formData.append('login_name', user.login_name);

    return this.httpClient
      .post<APIResponse<User>>(this.endpoint, formData)
      .pipe(map((apiResponse) => apiResponse.payload));
  }

  removeProfilePicture(user: User): Observable<any> {
    return this.httpClient.delete(this.endpoint + `?login_name=${user.login_name}`);
  }

  profilePictureSource(name: string, forceUpdate = false): string {
    if (forceUpdate) {
      return this.endpoint + `?login_name=${name}&x_rng=${Math.random()}`;
    } else {
      return this.endpoint + `?login_name=${name}`;
    }
  }
}
