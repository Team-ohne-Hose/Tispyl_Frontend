import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Game } from 'src/app/model/Game';

@Component({
  selector: 'app-game-display',
  templateUrl: './game-display.component.html',
  styleUrls: ['./game-display.component.css']
})
export class GameDisplayComponent implements OnInit {

  @Input('game') game: Game;
  @Input('dummy') isDummy: boolean;
  @Input() languageObjects: { };

  @Output('delete') deleteGame = new EventEmitter<Game>();

  constructor() {

  }

  ngOnInit() {
  }

  delete() {
    this.deleteGame.emit(this.game);
  }

}
