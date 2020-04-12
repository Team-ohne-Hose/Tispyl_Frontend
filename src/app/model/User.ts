
import * as hash from 'object-hash';

export class User {

  constructor(login: String, display: String, password: String) {
      this.login_name = login;
      this.display_name = display;
      this.password_hash = hash.MD5(password);
      this.creationDate = Date.now();
  }

  login_name: String;
  display_name: String;
  password_hash: String;
  creationDate: number;
}
