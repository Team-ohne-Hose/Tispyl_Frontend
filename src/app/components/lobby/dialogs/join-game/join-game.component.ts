import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.css']
})
export class JoinGameComponent {

  constructor(
    private router: Router,
    private  dialogRef: MatDialogRef<JoinGameComponent, void>,
    @Inject(MAT_DIALOG_DATA) public  data: any
  ) {
  }

  public closeMe() {
    this.dialogRef.close();
  }

  public join() {
    this.data.lobbyComponent.onEnterGame();
    this.router.navigateByUrl('/game').then(e => this.dialogRef.close());
  }
}
