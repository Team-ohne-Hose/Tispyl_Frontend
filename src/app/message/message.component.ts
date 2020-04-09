import {Component, Inject, Injectable, Output} from '@angular/core';

import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from  '@angular/material/dialog';
import {User} from '../model/User';

@Component({
  templateUrl:  './message.component.html',
  styleUrls: ['./message.component.css']
})
export  class  MessageComponent {

  loginName: String;
  displayName: String;
  pass0: String;
  pass1: String;


  constructor(private  dialogRef:  MatDialogRef<MessageComponent, User>, @Inject(MAT_DIALOG_DATA) public  data:  any) {
  }

  public closeMe() {
    this.dialogRef.close();
  }

  registerUser() {
    if (this.pass0 == this.pass1) {
      this.dialogRef.close(new User(this.loginName, this.displayName, this.pass0));
    } else {
      console.log("Passwörter stimmen nicht über ein.")
    }
  }
}
