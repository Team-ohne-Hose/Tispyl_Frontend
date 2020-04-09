
import * as hash from 'object-hash';

export class User {

  constructor(login: String, display: String, password: String) {
      this.login = login;
      this.display = display;
      this.password = hash.MD5(password);
      this.creationDate = Date.now();
  }

  login: String;
  display: String;
  password: String;
  creationDate: number;
}
