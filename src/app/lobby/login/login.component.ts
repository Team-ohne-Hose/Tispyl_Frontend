import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {RegisterPopupComponent} from '../dialogs/register-popup/register-popup.component';
import {TextContainer} from '../../model/TextContainer';
import {User} from '../../model/User';
import * as hash from 'object-hash';
import {UserService} from '../../services/user.service';
import {APIResponse} from '../../model/APIResponse';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private dialog: MatDialog, private userManagent: UserService) { }

  @Input() languageObjects: TextContainer;

  login_name = '';
  password_plain = '';
  errorMessage = '';

  dialog_config: MatDialogConfig = {
    width: '80%',
    maxWidth: '500px',
    data: {},
    panelClass: 'modalbox-base'
  };

  onLogin() {
    this.userManagent.loginUser(this.login_name, hash.MD5(this.password_plain)).subscribe( suc => {
      this.userManagent.setActiveUser(suc.payload[0]);
      console.debug('LOGGED IN AS:',  suc.payload[0]);
    }, err => {
      if (err.error as APIResponse<any[]> && err.error.success) {
        console.warn('Login Failed: ', err.error);
        this.errorMessage = 'Failed to login. Check your credentials.';
      } else {
        console.error('Unexpected error: ', err);
        this.errorMessage = 'Failed to reach Server. <a href="https://stats.uptimerobot.com/ZpvXzhMyG8">More information</a>';
      }
    });
  }

  enter(keyEvent) {
    if (keyEvent.key === 'Enter') {
      this.onLogin();
    }
  }

  openRegisterDialog() {
    const dialogRef: MatDialogRef<RegisterPopupComponent, User> = this.dialog.open(RegisterPopupComponent, this.dialog_config);
    dialogRef.afterClosed().subscribe(usr => {
      if (usr !== undefined) {
        this.userManagent.addUser(usr).subscribe( suc => {
          console.debug('Registered: ', suc);
        }, err => {
          console.error('Unexpected error: ', err);
        });
      }
    });
  }
}
