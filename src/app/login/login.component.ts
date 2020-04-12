import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {RegisterPopupComponent} from '../register-popup/register-popup.component';
import {Translation} from '../model/Translation';
import {TextContainer} from '../model/TextContainer';
import {User} from '../model/User';
import {Login} from '../model/Login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private dialog: MatDialog) { }

  @Input() languageObjects: TextContainer;
  @Output() registrationEvent = new EventEmitter<User>();
  @Output() loginEvent = new EventEmitter<Login>()

  login_name: string;
  password_plain: string;

  dialog_config: MatDialogConfig = {
    width: '80%',
    maxWidth: '500px',
    data: {},
    panelClass: 'modalbox-base'
  };

  onlogin() {
    let l: Login = {name: this.login_name, password: this.password_plain}
    this.loginEvent.emit(l)
  }

  openRegisterDialog() {
    let dialogRef: MatDialogRef<RegisterPopupComponent, User> = this.dialog.open(RegisterPopupComponent, this.dialog_config)
    dialogRef.afterClosed().subscribe(usr => {
      if (usr !== undefined) {
        this.registrationEvent.emit(usr)
      }
    });
  }
}
