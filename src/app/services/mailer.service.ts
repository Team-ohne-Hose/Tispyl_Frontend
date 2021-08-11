import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { APIResponse } from '../model/APIResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MailerService {
  readonly endpoint = environment.endpoint + 'mailer';

  constructor(private http: HttpClient) {}

  submitMail(email: string, text: string): Observable<APIResponse<void>> {
    return this.http.post<APIResponse<void>>(this.endpoint + '/submit', { email, text }).pipe(
      map((res: APIResponse<void>) => {
        return res;
      })
    );
  }
}
