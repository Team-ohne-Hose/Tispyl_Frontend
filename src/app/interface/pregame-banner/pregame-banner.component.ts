import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../../model/GameState';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {GameActionType, MessageType} from '../../model/WsData';

@Component({
  selector: 'app-pregame-banner',
  templateUrl: './pregame-banner.component.html',
  styleUrls: ['./pregame-banner.component.css']
})
export class PregameBannerComponent {

  isReady = false;

  @Input()
  players: Player[];

  constructor( private colyseus: ColyseusClientService) {}

  readyEvent() {
    this.isReady = !this.isReady;
    this.colyseus.getActiveRoom().subscribe( r => {
      r.send( {type: MessageType.GAME_MESSAGE, action: GameActionType.readyPropertyChange, isReady: this.isReady} );
    });
  }

  countReadyPlayers() {
    return this.players.filter(p => p.isReady).length;
  }

}
