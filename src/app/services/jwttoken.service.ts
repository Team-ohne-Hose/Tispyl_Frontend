import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { APIResponse } from '../model/APIResponse';
import { BasicUser, UserService } from './user.service';
import moment from 'moment';
import { RegisterOptions } from '../model/RegisterOptions';
import { Observable, throwError } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

export class JwtResponse {
  jwtToken: string;
  expiresIn: string;
}

@Injectable({ providedIn: 'root' })
export class JwtTokenService {
  private JwtToken: string = null;
  readonly endpoint = environment.endpoint + 'user';

  constructor(private http: HttpClient, private userService: UserService) {}

  /** Tries to retrieves expires_at value from local storage */
  private getExpiration(): moment.Moment {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  /** Stores jwt-token for a given user name in the local storage */
  private storeToken(authResult: JwtResponse, username: string): void {
    console.info('Session-Key saved.');
    const expiresAt = moment().add(authResult.expiresIn, 'second');
    localStorage.setItem('jwt_token', authResult.jwtToken);
    localStorage.setItem('username', username);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
  }

  login(username: string, password: string): Observable<BasicUser> {
    return this.http.post<APIResponse<JwtResponse>>(this.endpoint + '/token', { username, password }).pipe(
      map((jwt: APIResponse<JwtResponse>) => {
        if (jwt.success) {
          this.storeToken(jwt.payload, username);
          return jwt;
        } else {
          throwError(jwt);
        }
      }),
      flatMap(() => this.userService.getUserByLoginName(username)),
      map((usr: APIResponse<BasicUser>) => {
        this.userService.setActiveUser(usr.payload as BasicUser);
        return usr.payload;
      })
    );
  }

  register(registerOptions: RegisterOptions): Observable<boolean> {
    return this.http.post<APIResponse<JwtResponse>>(this.endpoint, registerOptions).pipe(
      map((jwt: APIResponse<JwtResponse>) => {
        if (jwt.success) {
          return true;
        } else {
          throwError(jwt);
        }
      })
    );
  }

  public logout(): void {
    localStorage.clear();
    this.userService.setActiveUser(undefined);
  }

  public isLoggedIn(): boolean {
    return moment().isBefore(this.getExpiration());
  }

  public isLoggedOut(): boolean {
    return !this.isLoggedIn();
  }

  public setJwtToken(token: string): void {
    this.JwtToken = token;
  }

  public getJwtToken(): string {
    return this.JwtToken;
  }
}
