import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { APIResponse } from '../model/APIResponse';

@Injectable({
  providedIn: 'root',
})
export class MailerService {
  readonly endpoint = environment.endpoint + 'mailer';

  constructor(private http: HttpClient) {}

  submitMail(email: string, text: string) {
    return this.http.post<APIResponse<void>>(this.endpoint + '/submit', { email, text }).pipe(
      map((res: APIResponse<void>) => {
        return res;
      })
    );
  }
}
