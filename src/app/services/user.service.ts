import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, pipe} from 'rxjs';
import {User} from '../model/User';
import {map} from 'rxjs/operators';
import {APIResponse} from '../model/APIResponse';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly prodUserEndpoint = 'https://tispyl.uber.space:41920/api/users';
  private readonly devUserEndpoint = 'http://localhost:25670/api/users';
  private userEndpoint = environment.production ? this.prodUserEndpoint : this.devUserEndpoint;
  activeUser: BehaviorSubject<User>;

  constructor(private httpClient: HttpClient) {
    this.activeUser = new BehaviorSubject<User>(undefined);
  }

  setActiveUser(user: User): void {
    this.activeUser.next(user);
  }

  getActiveUser(): Observable<User> {
    return this.activeUser.asObservable();
  }

  getUserById(user_id: number): Observable<User> {
    const requestUrl = this.userEndpoint + '?user_id=' + user_id;
    return this.httpClient
      .get<User[]>(requestUrl)
      .pipe(map(users => users[0]));
  }

  getUserByLoginName(login_name: string): Observable<User> {
    const requestUrl = this.userEndpoint + '?login_name=' + login_name;
    return this.httpClient
      .get<User[]>(requestUrl)
      .pipe(map(users => users[0]));
  }

  removeUser(user_id: number): Observable<number> {
    const requestUrl = this.userEndpoint + '?user_id=' + user_id;
    return this.httpClient.delete<number>(requestUrl);
  }

  addUser(user: User): Observable<any> {
    return this.httpClient.post(this.userEndpoint, user);
  }

  loginUser(login_name: string, password_hash: string): Observable<APIResponse<User[]>> {
    return this.httpClient.post<APIResponse<User[]>>(this.userEndpoint + '/login', {login_name: login_name, password_hash: password_hash});
  }

  syncUserData(user: User): void {
    this.httpClient
      .post<APIResponse<User[]>>(this.userEndpoint + '/login', {login_name: user.login_name, password_hash: user.password_hash})
      .subscribe( response => {
        if ( response.payload[0] !== undefined ) {
          this.setActiveUser(response.payload[0]);
        } else {
          console.error('Failed to update user: ', response);
        }
      });
  }

}
