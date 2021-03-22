import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { RegisterPopupComponent } from '../dialogs/register-popup/register-popup.component';
import { TextContainer } from '../../../model/TextContainer';
import { LoginUser, User } from '../../../model/User';
import * as hash from 'object-hash';
import { UserService } from '../../../services/user.service';
import { APIResponse } from '../../../model/APIResponse';
import { JwtTokenService } from 'src/app/services/jwttoken.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private dialog: MatDialog, private userManagement: UserService, private jwtTokenService: JwtTokenService) { }

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
    this.jwtTokenService.login(this.login_name, hash.MD5(this.password_plain))
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
        this.userManagement.addUser(usr).subscribe(suc => {
          console.debug('Registered: ', suc);
        }, err => {
          console.error('Unexpected error: ', err);
        });
      }
    });
  }
}
