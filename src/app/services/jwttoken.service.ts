import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { APIResponse } from '../model/APIResponse';
import { UserService, LoginUser } from './user.service';
import moment from 'moment';
import { RegisterOptions } from '../model/RegisterOptions';
import * as hash from 'object-hash';

export class JwtResponse {
  jwtToken: string;
  expiresIn: string;
}

@Injectable({providedIn: 'root'})
export class JwtTokenService {

  private JwtToken: string = null;
  private readonly prodUserEndpoint = 'https://tispyl.uber.space:41920/api/user';
  private readonly devUserEndpoint = 'http://localhost:25670/api/user';
  private endpoint = environment.production ? this.prodUserEndpoint : this.devUserEndpoint;

  constructor(private http: HttpClient, private userService: UserService) {
  }

  login(username: string, password: string) {

    this.http.post<APIResponse<JwtResponse>>(this.endpoint + '/token', {username, password}).subscribe(
      res => {
        console.debug('Enter Subscribe');
        this.setSession(res, username);

        this.userService.getUserByLoginName(username).subscribe(userResponse => {
          console.debug('US', userResponse);
          this.userService.setActiveUser(userResponse.payload as LoginUser);
          console.debug('LOGGED IN AS:', userResponse.payload);
        });
      }
    );
  }

  register(registerOptions: RegisterOptions) {
    this.http.post<APIResponse<JwtResponse>>(this.endpoint, registerOptions).subscribe(res => {
      this.login(registerOptions.username, hash.MD5(registerOptions.password));
    });
  }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('username');
    this.userService.setActiveUser(undefined);
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  setJwtToken(token: string): void {
    this.JwtToken = token;
  }

  getJwtToken(): string {
    return this.JwtToken;
  }

  private getExpiration() {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  private setSession(authResult: APIResponse<JwtResponse>, username: string) {
    console.info('Session-Key saved.');
    const expiresAt = moment().add(authResult.payload.expiresIn, 'second');
    localStorage.setItem('jwt_token', authResult.payload.jwtToken);
    localStorage.setItem('username', username);

    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
    return authResult;
  }
}
