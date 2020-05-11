import { Injectable } from '@angular/core';
import {User} from '../model/User';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private readonly prodProfilePictureEndpoint = 'https://tispyl.uber.space:41920/api/profilePic';
  private readonly devProfilePictureEndpoint = 'http://localhost:2567/api/profilePic';
  private profilePictureEndpoint = environment.production ? this.prodProfilePictureEndpoint : this.devProfilePictureEndpoint;

  constructor(private httpClient: HttpClient) { }

  uploadProfilePicture(file: File, user: User): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('img', file, file.name);
    formData.append('hash', user.password_hash);
    formData.append('login_name', user.login_name);

    return this.httpClient.post(this.profilePictureEndpoint, formData);
  }

  removeProfilePicture(user: User): Observable<any> {
    return this.httpClient.delete(this.profilePictureEndpoint + `?login_name=${user.login_name}&hash=${user.password_hash}`);
  }

  profilePictureSource(name: string): string {
      return this.profilePictureEndpoint + `?login_name=${name}&x_rng=${Math.random()}`; // &hash=${user.password_hash}
  }


  // DELETE THIS!!
  tameProfilePictureSource(name: string): string {
    return this.profilePictureEndpoint + `?login_name=${name}`;
  }
}
