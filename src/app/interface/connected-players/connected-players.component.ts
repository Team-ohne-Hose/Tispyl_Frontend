import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {GameState, Player} from '../../model/GameState';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {MapSchema} from '@colyseus/schema';



@Component({
  selector: 'app-connected-players',
  templateUrl: './connected-players.component.html',
  styleUrls: ['./connected-players.component.css']
})
export class ConnectedPlayersComponent implements OnInit {

  @Input()
  players: Player[];

  @Input()
  turn: string;

  ngOnInit(): void {
  }
}
