import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MessageComponent} from '../message/message.component';
import {Translation} from '../model/Translation';
import {TextContainer} from '../model/TextContainer';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private  dialog:  MatDialog) { }

  @Input() languageObjects: TextContainer;

  ngOnInit() {
  }

  login(ev) {
    console.log('REGOSTER! UwU');
  }

  openRegisterDialog() {
    this.dialog.open(MessageComponent,{
      width: '80%',
      height: '80%',
      data: {},
      panelClass: 'register-modalbox'
    });
  }
}
