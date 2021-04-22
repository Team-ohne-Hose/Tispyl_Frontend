import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { User } from '../../../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { APIResponse } from '../../../../model/APIResponse';

interface TileSet {
  id: number;
  name: string;
  thumbnailPath: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  templateUrl: './open-game-popup.component.html',
  styleUrls: ['./open-game-popup.component.css']
})
export class OpenGamePopupComponent implements OnInit {
  private readonly defaultThumbPath = '';
  roomName;
  skinName: string;
  randomizeTiles;
  deckList: TileSet[];
  selectedIndex = 0;

  constructor(private dialogRef: MatDialogRef<OpenGamePopupComponent, { roomName: string, skinName: string, randomizeTiles: boolean }>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private httpClient: HttpClient) {
    const requestUrl = environment.endpoint + 'gameboard/tileset/';
    const req = this.httpClient.get<APIResponse<TileSet[]>>(requestUrl);
    req.subscribe((res: APIResponse<TileSet[]>) => {
      const ts = res.payload;
      ts.forEach((val: TileSet) => {
        if (val.thumbnailPath === undefined || val.thumbnailPath === null) {
          val.thumbnailPath = this.defaultThumbPath;
        }
      });
      this.deckList = ts;
    }, (error: any) => {
      console.error('couldnt retrieve list of available decks', error);
    });
  }

  public closeMe() {
    this.dialogRef.close();
  }

  public createGame() {
    if (this.roomName !== undefined) {
      this.dialogRef.close({
        roomName: this.roomName,
        skinName: (this.skinName !== undefined && this.skinName.length > 0) ? this.skinName : 'default',
        randomizeTiles: this.randomizeTiles || false
      });
    } else {
      console.log('No roomName was entered.');
      this.dialogRef.close();
    }
  }

  ngOnInit(): void {
  }

}
