import * as hash from 'object-hash';

export class User {

  constructor(login: string, display: string, password: string) {
    this.login_name = login;
    this.display_name = display;
    this.password_hash = hash.MD5(password);
  }

  login_name: string;
  display_name: string;
  password_hash: string;
  user_creation: string;
  time_played: number;
  profile_picture: string;
  last_figure: string;
  is_connected: boolean;
  is_dev: boolean;
}


export class LoginUser {

  login_name: string;
  display_name: string;
  user_creation: string;
  time_played: number;
  profile_picture: string;
  last_figure: string;
  is_connected: boolean;
  is_dev: boolean;
}