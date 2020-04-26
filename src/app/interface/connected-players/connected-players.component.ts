import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {GameState} from '../../model/state/GameState';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {MapSchema} from '@colyseus/schema';
import {Player} from '../../model/state/Player';



@Component({
  selector: 'app-connected-players',
  templateUrl: './connected-players.component.html',
  styleUrls: ['./connected-players.component.css']
})
export class ConnectedPlayersComponent implements OnInit {

  @Input()
  players: Player[];

  @Input()
  currentPlayerDisplayName: string;

  ngOnInit(): void {
  }
}
