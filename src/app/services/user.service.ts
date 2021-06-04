import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { APIResponse } from '../model/APIResponse';
import { environment } from '../../environments/environment';
import * as hash from 'object-hash';

export class BasicUser {
  id: number;
  login_name: string;
  display_name: string;
  user_creation: string;
  time_played: number;
  profile_picture: string;
  last_figure: string;
  is_connected: boolean;
  is_dev: boolean;
}

export class LoginUser extends BasicUser {
  password_hash;
}

// export class OldUser {
//   id: number;
//   login_name: string;
//   display_name: string;
//   password_hash: string;
//   user_creation: string;
//   time_played: number;
//   profile_picture: string;
//   last_figure: string;
//   is_connected: boolean;
//   is_dev: boolean;

//   constructor(login: string, display: string, password: string) {
//     this.login_name = login;
//     this.display_name = display;
//     this.password_hash = hash.MD5(password);
//   }
// }

// export class OldLoginUser {
//   id: number;
//   login_name: string;
//   display_name: string;
//   user_creation: string;
//   time_played: number;
//   profile_picture: string;
//   last_figure: string;
//   is_connected: boolean;
//   is_dev: boolean;
// }
// export class OldForeignUser extends OldLoginUser { }

@Injectable({
  providedIn: 'root',
})
export class UserService {
  activeUser: BehaviorSubject<LoginUser>;
  profileUser: BasicUser;

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
  getActiveUser(): Observable<BasicUser> {
    return this.activeUser.asObservable();
  }

  // REQUESTS

  getUserByLoginName(login_name: string): Observable<APIResponse<BasicUser>> {
    return this.httpClient.get<APIResponse<BasicUser>>(this.userEndpoint + '?login_name=' + login_name);
  }

  removeUser(user_id: number): Observable<number> {
    const requestUrl = this.userEndpoint + '?user_id=' + user_id;
    return this.httpClient.delete<number>(requestUrl);
  }

  syncUserData(user: LoginUser): void {
    this.httpClient
      .get<APIResponse<LoginUser>>(this.userEndpoint + '?login_name=' + user.login_name)
      .subscribe((response) => {
        if (response.payload !== undefined) {
          this.setActiveUser(response.payload as LoginUser);
        } else {
          console.error('Failed to update user: ', response);
        }
      });
  }

  requestUserDatabyId(userId: number): Observable<APIResponse<BasicUser>> {
    const requestUrl = this.userEndpoint + '/byId?userId=' + userId;
    return this.httpClient.get<APIResponse<BasicUser>>(requestUrl);
  }
}
