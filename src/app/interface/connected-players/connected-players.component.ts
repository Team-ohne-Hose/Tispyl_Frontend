import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../../model/GameState';


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

  constructor() { }

  ngOnInit(): void {
  }

}
