import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { GameLobby } from 'src/app/model/GameLobby';
import {RoomAvailable} from 'colyseus.js';
import {RoomMetaInfo} from '../model/RoomMetaInfo';
import {Router} from '@angular/router';

@Component({
  selector: 'app-game-display',
  templateUrl: './game-display.component.html',
  styleUrls: ['./game-display.component.css']
})
export class GameDisplayComponent{
  @Input() game: RoomAvailable<RoomMetaInfo>;
  @Input() isDummy: boolean;
  @Input() isActive: boolean;
  @Input() languageObjects: { };

  @Output('leave') leaveGame = new EventEmitter<void>();
  @Output('join') joinGame = new EventEmitter<RoomAvailable<RoomMetaInfo>>();

  constructor(public router: Router) {

  }

  leave() {
    this.leaveGame.emit();
  }

  enter() {
    this.router.navigateByUrl('/game')
  }

  join(){
    this.joinGame.emit(this.game)
  }
}
