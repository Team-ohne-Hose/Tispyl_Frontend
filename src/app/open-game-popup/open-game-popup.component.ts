import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {User} from '../model/User';
import {RegisterPopupComponent} from '../register-popup/register-popup.component';

@Component({
  templateUrl: './open-game-popup.component.html',
  styleUrls: ['./open-game-popup.component.css']
})
export class OpenGamePopupComponent implements OnInit {
  lobbyName;

  constructor(private  dialogRef:  MatDialogRef<OpenGamePopupComponent, string>, @Inject(MAT_DIALOG_DATA) public  data:  any) {
  }

  public closeMe() {
    this.dialogRef.close();
  }
  public createGame() {
    if (this.lobbyName !== undefined) {
      this.dialogRef.close(this.lobbyName);
    } else {
      console.log('No lobbyName was entered.');
      this.dialogRef.close();
    }
  }
  ngOnInit(): void {
  }

}
