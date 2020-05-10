import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {GameActionType, GameShowTile, MessageType} from '../../model/WsData';
import {BoardTilesService} from '../../services/board-tiles.service';


@Component({
  selector: 'app-tile-overlay',
  templateUrl: './tile-overlay.component.html',
  styleUrls: ['./tile-overlay.component.css']
})
export class TileOverlayComponent {

  @Output() printer: EventEmitter<string> = new EventEmitter<string>();
  @Input() playerName: string;

  constructor( private colyseus: ColyseusClientService, private boardTiles: BoardTilesService ) {
    this.colyseus.registerMessageCallback(MessageType.GAME_MESSAGE, {
      filterSubType: GameActionType.showTile,
      f: ( data: GameShowTile ) => this.printer.emit(`[EVENT]: ${this.playerName} ist auf Feld ${data.tile} gelandet: ${this.descriptionOf(data.tile)}`)
    });
  }

  descriptionOf( index: number ) {
    const tile = this.boardTiles.getTile(index);
    return tile === undefined ? 'ERROR!' : tile.description;
  }

}
