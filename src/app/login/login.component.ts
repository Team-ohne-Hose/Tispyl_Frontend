import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {RegisterPopupComponent} from '../register-popup/register-popup.component';
import {TextContainer} from '../model/TextContainer';
import {User} from '../model/User';
import * as hash from 'object-hash';
import {UserService} from '../services/user.service';
import {APIResponse} from '../model/APIResponse';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private dialog: MatDialog, private userManagent: UserService) { }

  @Input() languageObjects: TextContainer;
  @Output() loginEvent = new EventEmitter<User>();

  login_name = '';
  password_plain = '';
  errorMessage = '';

  dialog_config: MatDialogConfig = {
    width: '80%',
    maxWidth: '500px',
    data: {},
    panelClass: 'modalbox-base'
  };

  onlogin() {
    this.userManagent.loginUser(this.login_name, hash.MD5(this.password_plain)).subscribe( suc => {
      console.log(suc.payload);
      this.loginEvent.emit(suc.payload[0]);
    }, err => {
      if (err.error as APIResponse<any[]> && err.error.success) {
        console.log('Login Failed: ', err.error);
        this.errorMessage = 'Failed to login. Check your credentials.';
      } else {
        console.log('Unexpected error: ', err);
      }
    });
  }

  enter(keyEvent) {
    if (keyEvent.key === 'Enter') {
      this.onlogin();
    }
  }

  openRegisterDialog() {
    const dialogRef: MatDialogRef<RegisterPopupComponent, User> = this.dialog.open(RegisterPopupComponent, this.dialog_config);
    dialogRef.afterClosed().subscribe(usr => {
      if (usr !== undefined) {
        this.userManagent.addUser(usr).subscribe( suc => {
          console.log('Registered: ', suc);
        }, err => {
          console.log('Unexpected error: ', err);
        });
      }
    });
  }
}
