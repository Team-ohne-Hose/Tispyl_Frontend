import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { GameLobby } from 'src/app/model/GameLobby';

@Component({
  selector: 'app-game-display',
  templateUrl: './game-display.component.html',
  styleUrls: ['./game-display.component.css']
})
export class GameDisplayComponent{
  @Input('game') game: GameLobby;
  @Input('dummy') isDummy: boolean;
  @Input() languageObjects: { };

  @Output('delete') deleteGame = new EventEmitter<GameLobby>();

  delete() {
    this.deleteGame.emit(this.game);
  }
}
