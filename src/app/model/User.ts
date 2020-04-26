import * as hash from 'object-hash';

export class User {

  constructor(login: string, display: string, password: string) {
      this.login_name = login;
      this.display_name = display;
      this.password_hash = hash.MD5(password);
      this.creationDate = Date.now();
  }

  login_name: string;
  display_name: string;
  password_hash: string;
  creationDate: number;
}
