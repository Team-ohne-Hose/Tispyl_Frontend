import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MariaService {

  private userEndpoint = 'http://localhost:2567/api/users';

  constructor(private httpClient: HttpClient) {}

}
