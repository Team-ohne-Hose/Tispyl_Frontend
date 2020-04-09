import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MessageComponent} from '../message/message.component';
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

  constructor(private  dialog:  MatDialog) { }

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
    let dialogRef: MatDialogRef<MessageComponent, User> = this.dialog.open(MessageComponent,{
      width: '80%',
      maxWidth: '500px',
      height: '80%',
      data: {},
      panelClass: 'register-modalbox'
    })

    dialogRef.afterClosed().subscribe(r => {
      this.registrationEvent.emit(r)
    });
  }
}
