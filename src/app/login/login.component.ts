import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor() { }

  @Input() languageObjects: { };

  ngOnInit() {
  }

  openRegisterDialog(ev) {
    console.log('REGOSTER! UwU');
  }

  login(usr: String, psw: String) {

  }
}
