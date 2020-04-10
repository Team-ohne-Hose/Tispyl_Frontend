import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
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
export class LoginComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  @Input() languageObjects: TextContainer;
  @Output() registrationEvent = new EventEmitter<User>();
  @Output() loginEvent = new EventEmitter<Login>()

  loginName: String;
  password: String;

  ngOnInit() {
  }

  onlogin() {
    let l: Login = {name: 'tizian', password: 'handball'}
    this.loginEvent.emit(l)
  }

  openRegisterDialog() {
    let dialogRef: MatDialogRef<RegisterPopupComponent, User> = this.dialog.open(RegisterPopupComponent,{
      width: '80%',
      maxWidth: '500px',
      height: '80%',
      data: {},
      panelClass: 'modalbox-base'
    })

    dialogRef.afterClosed().subscribe(r => {
      this.registrationEvent.emit(r)
    });
  }
}
