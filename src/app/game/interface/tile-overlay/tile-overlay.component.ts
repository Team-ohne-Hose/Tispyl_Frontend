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
  attachColyseusStateCallbacks(gameState: GameStateService): void {}
  attachColyseusMessageCallbacks(gameState: GameStateService): void {
    gameState.registerMessageCallback(MessageType.GAME_MESSAGE, {
      filterSubType: GameActionType.showTile,
      f: ( data: GameShowTile ) => {
        if (data.action === GameActionType.showTile) {
          console.log(`[EVENT]: ${this.playerName} ist auf Feld ${data.tile} gelandet: ${this.descriptionOf(data.tile)}`);
        }
      }
    });
  }

  descriptionOf( index: number ) {
    const tile = this.boardTiles.getTile(index);
    return tile === undefined ? 'ERROR!' : tile.description;
  }

}
