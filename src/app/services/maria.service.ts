import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/User';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MariaService {

  private userEndpoint = 'http://localhost:2567/api/users';

  constructor(private httpClient: HttpClient) {}

  addUsers(usr: User): Observable<any> {
    return this.httpClient.put(this.userEndpoint, usr);
  }

  getUser(name: string): Observable<any> {
    return this.httpClient.get(this.userEndpoint + '?login_name=' + name);
  }

  login(name: string, password: string): Observable<any> {
    return this.httpClient.get(this.userEndpoint).pipe( map(users => {
      // console.log(users, name, password_plain);
      const authenticatedUser = (users as any[]).find( u => u['login_name'] === name && u['password_hash'] === password);
      return !!authenticatedUser;
    }));
  }
}
