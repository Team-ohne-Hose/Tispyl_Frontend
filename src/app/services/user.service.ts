import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, pipe} from 'rxjs';
import {User} from '../model/User';
import {query} from '@angular/animations';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userEndpoint = 'http://localhost:2567/api/users';

  constructor(private httpClient: HttpClient) { }

  getUserById(user_id: number): Observable<User> {
    return this.getUser(user_id).pipe(
      map( users => users[0] )
    );
  }

  getUser(user_id?: number, login_name?: string): Observable<User[]> {
    const queryString: string = (user_id || '') + (login_name || '');
    const requestUrl = this.userEndpoint + (queryString ? ('?' + queryString) : '');
    return this.httpClient.get<User[]>(requestUrl);
  }

}
