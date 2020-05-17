import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GameActionType, GameShowTile, MessageType} from '../../../model/WsData';
import {BoardTilesService} from '../../../services/board-tiles.service';
import {GameStateService} from '../../../services/game-state.service';
import {ColyseusNotifyable} from '../../../services/game-initialisation.service';


@Component({
  selector: 'app-tile-overlay',
  templateUrl: './tile-overlay.component.html',
  styleUrls: ['./tile-overlay.component.css']
})
export class TileOverlayComponent implements ColyseusNotifyable{

  @Output() printer: EventEmitter<string> = new EventEmitter<string>();
  @Input() playerName: string;

  constructor( private gameState: GameStateService, private boardTiles: BoardTilesService ) {
  }
  attachColyseusStateCallbacks(): void {}
  attachColyseusMessageCallbacks(): void {
    this.gameState.registerMessageCallback(MessageType.GAME_MESSAGE, {
      filterSubType: GameActionType.showTile,
      f: ( data: GameShowTile ) => this.printer.emit(`[EVENT]: ${this.playerName} ist auf Feld ${data.tile} gelandet: ${this.descriptionOf(data.tile)}`)
    });
  }

  descriptionOf( index: number ) {
    const tile = this.boardTiles.getTile(index);
    return tile === undefined ? 'ERROR!' : tile.description;
  }

}
