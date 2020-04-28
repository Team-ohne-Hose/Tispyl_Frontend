import {AfterContentInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ColyseusClientService} from '../services/colyseus-client.service';
import {InterfaceComponent} from '../interface/interface.component';
import {GameState} from '../model/state/GameState';
import {TurnOverlayComponent} from '../interface/turn-overlay/turn-overlay.component';

@Component({
  selector: 'app-debugdummy',
  templateUrl: './debugdummy.component.html',
  styleUrls: ['./debugdummy.component.css']
})
export class DebugdummyComponent {

  playerName;
  ownTurn = false;

  @ViewChild('turnOverlay') turnOverlay: TurnOverlayComponent;

  constructor() { }

  setName( name ) {
    console.log(name);
    this.playerName = name;
  }

}
