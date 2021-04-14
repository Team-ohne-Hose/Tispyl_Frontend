import { Component, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RegisterOptions } from 'src/app/model/RegisterOptions';
import { JwtTokenService } from 'src/app/services/jwttoken.service';
import { User } from '../../../../services/user.service';

@Component({
  templateUrl: './register-popup.component.html',
  styleUrls: ['./register-popup.component.css']
})
export class RegisterPopupComponent {

  login_name: string = '';
  display_name: string = '';
  password_0: string = '';
  password_1: string = '';

  errorMsg: string[] = [];

  constructor(private dialogRef: MatDialogRef<RegisterPopupComponent, User>, private AuthService: JwtTokenService, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  public close() {
    this.dialogRef.close();
  }

  registerUser() {
    const passwordChecks = this.validateInput();
    if (passwordChecks.length <= 0) {
      this.AuthService.register({username: this.login_name, displayname: this.display_name, password: this.password_0} as RegisterOptions);
      this.dialogRef.close();
    } else {
      console.warn('Registration violation: ' + passwordChecks);
      this.errorMsg = passwordChecks;
    }
  }

  validateInput(): string[] {
    // validation constants
    const minPasswordLength: number = 4;
    const maxPasswordLength: number = 64;

    // validation checks
    const arePasswordsEqual: [boolean, string] = [
      this.password_0 === this.password_1,
      'Password_0 was not equal to Password_1'
    ];

    const hasPasswordCorrectLength: [boolean, string] = [
      this.password_0.length >= minPasswordLength && this.password_0.length <= maxPasswordLength,
      'Password length outside of the allowed range: [' + minPasswordLength + ', ' + maxPasswordLength + ']'
    ];

    return [arePasswordsEqual, hasPasswordCorrectLength].filter(e => !e[0]).map(e => e[1]);
  }
}
