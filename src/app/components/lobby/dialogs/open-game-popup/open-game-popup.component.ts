import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { APIResponse } from '../../../../model/APIResponse';
import { NgbCarousel, NgbCarouselConfig, NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgbSingleSlideEvent } from '@ng-bootstrap/ng-bootstrap/carousel/carousel';
import { noUndefined } from '@angular/compiler/src/util';

interface BoardTile {
  id: number;
  name: string;
  description: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}
interface SetField {
  id: number;
  fieldNumber: number;
  boardTile: BoardTile;
  restrictRing: number;
  restrictField: number;
  createdAt: Date;
  updatedAt: Date;
}
interface Tag {
  id: number;
  tag: string;
}
interface DefaultRule {
  id: number;
  rule: string;
}
interface Author {
  display_name: string;
  login_name: string;
  id: number;
}
interface TileSet {
  id: number;
  name: string;
  description: string;
  author: Author;
  thumbnailPath: string;
  tags: Tag[];
  defaultRules: DefaultRule[];
  __fields__: SetField[];
  createdAt: Date;
  updatedAt: Date;
}
export interface DialogResult {
  roomName: string;
  tileSetId: number;
  randomizeTiles: boolean;
  enableItems: boolean;
  enableMultipleItems: boolean;
}

@Component({
  templateUrl: './open-game-popup.component.html',
  styleUrls: ['./open-game-popup.component.css'],
  providers: [NgbCarouselConfig],
})
export class OpenGamePopupComponent {
  private static readonly defaultThumbPath = '/assets/untitled_ts.png';
  private static readonly requestUrl = environment.endpoint + 'gameboard/tileset/';
  roomName;
  skinName: string;
  randomizeTiles = false;
  enableItems = false;
  enableMultipleItems = false;
  deckList: TileSet[];
  selectedDeck = 0;

  selectedDeckExt: TileSet = undefined;
  tileListAsSet: Map<number, { bt: BoardTile; count: number }> = new Map<number, { bt: BoardTile; count: number }>();
  popoverVisible = false;

  @ViewChild('deckCarousel', { static: true }) deckCarousel: NgbCarousel;

  // Onclick FieldList
  //  multiples as x2 - tag
  //  only list of pictures

  constructor(
    private dialogRef: MatDialogRef<OpenGamePopupComponent, DialogResult>,
    private httpClient: HttpClient,
    config: NgbCarouselConfig
  ) {
    config.interval = 0;
    config.showNavigationIndicators = false;
    config.showNavigationArrows = false;

    const req = this.httpClient.get<APIResponse<TileSet[]>>(OpenGamePopupComponent.requestUrl);
    req.subscribe(
      (res: APIResponse<TileSet[]>) => {
        const ts = res.payload;
        ts.forEach((val: TileSet) => {
          if (val.thumbnailPath === undefined || val.thumbnailPath === null) {
            val.thumbnailPath = OpenGamePopupComponent.defaultThumbPath;
          }
        });
        this.deckList = ts;
        this.loadTileSetData(this.deckList[0].id);
      },
      (error: any) => {
        console.error('couldnt retrieve list of available decks', error);
      }
    );
  }

  private generateTileListAsSet() {
    this.tileListAsSet.clear();
    this.selectedDeckExt.__fields__.forEach((val: SetField) => {
      const bt = val.boardTile;
      const entry = this.tileListAsSet.get(bt.id);
      if (entry === undefined) {
        this.tileListAsSet.set(bt.id, { bt: bt, count: 1 });
      } else {
        entry.count++;
      }
    });
    console.log('TileList is', this.tileListAsSet);
  }

  private loadTileSetData(id: number) {
    const req = this.httpClient.get<APIResponse<TileSet>>(OpenGamePopupComponent.requestUrl + `:id?id=${id}`);
    req.subscribe(
      (res: APIResponse<TileSet>) => {
        const ts = res.payload;
        this.selectedDeckExt = ts;
        console.log('set data', this.selectedDeckExt);
        this.generateTileListAsSet();
      },
      (error: any) => {
        this.selectedDeckExt = undefined;
        console.error('couldnt retrieve list of available decks', error);
      }
    );
  }

  public closeMe(): void {
    this.dialogRef.close();
  }

  public createGame() {
    if (this.roomName !== undefined) {
      this.dialogRef.close({
        roomName: this.roomName,
        tileSetId: this.deckList[this.selectedDeck].id || 1,
        randomizeTiles: this.randomizeTiles || false,
        enableItems: this.enableItems || false,
        enableMultipleItems: this.enableMultipleItems || false,
      });
    } else {
      console.log('No roomName was entered.');
      this.dialogRef.close();
    }
  }

  slid(evt: NgbSingleSlideEvent, slide: number): void {
    if (evt.isShown) {
      this.selectedDeck = slide;
      const elmnt = document.getElementById('deck-list-entry-' + slide);
      console.log('elmnt is', elmnt);
      // elmnt.scrollIntoView();
    }
  }

  selectCarousel(id: number): void {
    console.log('selecting', id);
    this.deckCarousel.select('deckSlide-' + id);
  }

  slide(evt: NgbSlideEvent): void {
    // search for the element in deckList with matching html-id
    let i: number;
    const ts: TileSet = this.deckList.find((val: TileSet, index: number) => {
      if (`deckSlide-${val.id}` === evt.current) {
        i = index;
        return true;
      }
    });
    // if found, select the correct one
    if (ts !== undefined) {
      this.loadTileSetData(this.deckList[i].id);
      this.selectedDeck = i;
      const elmnt = document.getElementById('deck-list-entry-' + i);
      console.log('elmnt is', elmnt);
      elmnt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}
