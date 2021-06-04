import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import * as hash from 'object-hash';
import { map } from 'rxjs/operators';
import { APIResponse } from '../model/APIResponse';
import { environment } from '../../environments/environment';
import { JwtResponse } from './jwttoken.service';

export class User {
  login_name: string;
  display_name: string;
  password_hash: string;
  user_creation: string;
  time_played: number;
  profile_picture: string;
  last_figure: string;
  is_connected: boolean;
  is_dev: boolean;

  constructor(login: string, display: string, password: string) {
    this.login_name = login;
    this.display_name = display;
    this.password_hash = hash.MD5(password);
  }
}

export class LoginUser {
  login_name: string;
  display_name: string;
  user_creation: string;
  time_played: number;
  profile_picture: string;
  last_figure: string;
  is_connected: boolean;
  is_dev: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  activeUser: BehaviorSubject<LoginUser>;
  private userEndpoint = environment.endpoint + 'user';

  constructor(private httpClient: HttpClient) {
    this.activeUser = new BehaviorSubject<LoginUser>(undefined);
  }

  setActiveUser(user: LoginUser): void {
    this.activeUser.next(user);
  }

  /**
   * @deprecated The method should not be used as it removes the benefits of using a BehaviorSubject
   * @See {rxjs.BehaviorSubject}
   */
  getActiveUser(): Observable<LoginUser> {
    return this.activeUser.asObservable();
  }

  // REQUESTS

  getUserById(user_id: number): Observable<User> {
    const requestUrl = this.userEndpoint + '?user_id=' + user_id;
    return this.httpClient.get<User[]>(requestUrl).pipe(map((users) => users[0]));
  }

  getUserByLoginName(login_name: string): Observable<APIResponse<LoginUser>> {
    return this.httpClient.get<APIResponse<LoginUser>>(this.userEndpoint + '?login_name=' + login_name);
  }

  removeUser(user_id: number): Observable<number> {
    const requestUrl = this.userEndpoint + '?user_id=' + user_id;
    return this.httpClient.delete<number>(requestUrl);
  }

  addUser(user: User): Observable<any> {
    return this.httpClient.post(this.userEndpoint, user);
  }

  loginUser(login_name: string, password_hash: string): Observable<APIResponse<JwtResponse>> {
    return this.httpClient.post<APIResponse<JwtResponse>>(this.userEndpoint + '/token', {
      username: login_name,
      password: password_hash,
    });
  }

  syncUserData(user: User): void {
    this.httpClient
      .get<APIResponse<User>>(this.userEndpoint + '?login_name=' + user.login_name)
      .subscribe((response) => {
        if (response.payload !== undefined) {
          this.setActiveUser(response.payload as LoginUser);
        } else {
          console.error('Failed to update user: ', response);
        }
      });
  }
}
