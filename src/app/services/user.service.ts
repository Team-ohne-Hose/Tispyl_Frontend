import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { APIResponse } from '../model/APIResponse';
import { environment } from '../../environments/environment';
import { EditUserData } from '../components/home/profile/edit-profile/edit-profile.component';
import { AppToastService } from './toast.service';

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

@Injectable({
  providedIn: 'root',
})
export class UserService {
  activeUser: BehaviorSubject<LoginUser>;
  profileUser: BasicUser;

  private endpoint = environment.endpoint + 'user';

  constructor(private httpClient: HttpClient, private toastService: AppToastService) {
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
    return this.httpClient.get<APIResponse<BasicUser>>(this.endpoint + '?login_name=' + login_name);
  }

  removeUser(user_id: number): Observable<number> {
    const requestUrl = this.endpoint + '?user_id=' + user_id;
    return this.httpClient.delete<number>(requestUrl);
  }

  syncUserData(user: LoginUser): void {
    this.httpClient
      .get<APIResponse<LoginUser>>(this.endpoint + '?login_name=' + user.login_name)
      .subscribe((response) => {
        if (response.payload !== undefined) {
          this.setActiveUser(response.payload as LoginUser);
        } else {
          console.error('Failed to update user: ', response);
        }
      });
  }

  requestUserDatabyId(userId: number): Observable<APIResponse<BasicUser>> {
    const requestUrl = this.endpoint + '/byId?userId=' + userId;
    return this.httpClient.get<APIResponse<BasicUser>>(requestUrl);
  }

  updateUser(userData: EditUserData): void {
    const requestUrl = this.endpoint;

    this.httpClient.patch<APIResponse<LoginUser>>(requestUrl, userData).subscribe((response) => {
      if (!response.success) {
        this.toastService.show(
          'Error',
          'Beim aktualisieren deines Profils ist etwas schief gelaufen.',
          'bg-danger text-light',
          3000
        );
        return;
      }

      this.activeUser.next(response.payload);

      this.toastService.show('Success', 'Dein Profil wurde erfolgreich aktualisiert.', 'bg-success text-light', 3000);
    });
  }
}
