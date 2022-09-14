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

@Injectable({
  providedIn: 'root',
})
export class UserService {
  activeUser: BehaviorSubject<BasicUser> = new BehaviorSubject<BasicUser>(undefined);

  private userEndpoint = environment.endpoint + 'user';

  constructor(private httpClient: HttpClient, private toastService: AppToastService) {}

  setActiveUser(user: BasicUser): void {
    this.activeUser.next(user);
  }

  // REQUESTS

  getUserByLoginName(login_name: string): Observable<APIResponse<BasicUser>> {
    return this.httpClient.get<APIResponse<BasicUser>>(this.userEndpoint + '?login_name=' + login_name);
  }

  removeUser(user_id: number): Observable<number> {
    const requestUrl = this.userEndpoint + '?user_id=' + user_id;
    return this.httpClient.delete<number>(requestUrl);
  }

  syncUserData(user: BasicUser): void {
    this.httpClient.get<APIResponse<BasicUser>>(this.userEndpoint + '?login_name=' + user.login_name).subscribe((response) => {
      if (response.payload !== undefined) {
        this.setActiveUser(response.payload as BasicUser);
      } else {
        console.error('Failed to update user: ', response);
      }
    });
  }

  requestUserDatabyId(userId: number): Observable<APIResponse<BasicUser>> {
    const requestUrl = this.userEndpoint + '/byId?userId=' + userId;
    return this.httpClient.get<APIResponse<BasicUser>>(requestUrl);
  }

  updateUser(userData: EditUserData): void {
    const requestUrl = this.userEndpoint;

    this.httpClient.patch<APIResponse<BasicUser>>(requestUrl, userData).subscribe((response) => {
      if (!response.success) {
        this.toastService.show('Error', 'Beim aktualisieren deines Profils ist etwas schief gelaufen.', 'bg-danger text-light', 3000);
        return;
      }

      this.activeUser.next(response.payload);

      this.toastService.show('Success', 'Dein Profil wurde erfolgreich aktualisiert.', 'bg-success text-light', 3000);
    });
  }
}
