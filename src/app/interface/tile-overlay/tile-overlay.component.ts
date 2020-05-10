import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {GameActionType, GameShowTile, MessageType} from '../../model/WsData';
// @ts-ignore
import boardTiles from '../../resources/boardTiles.json';
import {Tile} from '../../model/Board';


@Component({
  selector: 'app-tile-overlay',
  templateUrl: './tile-overlay.component.html',
  styleUrls: ['./tile-overlay.component.css']
})
export class TileOverlayComponent {

  @Output() printer: EventEmitter<string> = new EventEmitter<string>();
  @Input() playerName: string;

  private tiles:  Tile[] = boardTiles.base;

  constructor( private colyseus: ColyseusClientService ) {
    this.colyseus.registerMessageCallback(MessageType.GAME_MESSAGE, {
      filterSubType: GameActionType.showTile,
      f: ( data: GameShowTile ) => this.printer.emit(`[EVENT]: ${this.playerName} ist auf Feld ${data.tile} gelandet: ${this.descriptionOf(data.tile)}`)
    });
  }

  descriptionOf( index: number ) {
    return this.tiles[index].description;
  }

}
