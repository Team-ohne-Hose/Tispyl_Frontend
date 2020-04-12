import {Component, Inject, Injectable, Output} from '@angular/core';

import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from  '@angular/material/dialog';
import {User} from '../model/User';

@Component({
  templateUrl:  './register-popup.component.html',
  styleUrls: ['./register-popup.component.css']
})
export class RegisterPopupComponent {

  login_name: string = '';
  display_name: string = '';
  password_0: string = '';
  password_1: string = '';

  constructor(private  dialogRef:  MatDialogRef<RegisterPopupComponent, User>, @Inject(MAT_DIALOG_DATA) public  data:  any) {
  }

  public closeMe() {
    this.dialogRef.close();
  }

  registerUser() {
    const violations: string[] = this.validateInput()
    if (violations.length == 0) {
      this.dialogRef.close(new User(this.login_name, this.display_name, this.password_0));
    } else {
      console.log('Registration violation: ' + violations)
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
    ]

    const hasPasswordCorrectLength: [boolean, string] = [
      this.password_0.length >= minPasswordLength && this.password_0.length <= maxPasswordLength,
      'Password length outside of the allowed range: [' + minPasswordLength + ', ' + maxPasswordLength + ']'
    ]

    return [arePasswordsEqual, hasPasswordCorrectLength].filter( e => !e[0] ).map( e => e[1] )
  }
}
