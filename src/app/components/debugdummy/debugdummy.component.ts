/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component } from '@angular/core';
import { Player } from '../../model/state/Player';
@Component({
  selector: 'app-debugdummy',
  templateUrl: './debugdummy.component.html',
  styleUrls: ['./debugdummy.component.css'],
})
export class DebugdummyComponent {
  p = new Player('Kneggo', 'sdf', false);
  players: Player[] = [
    new Player('Peter Enis', 'lpeterenis', true),
    new Player('Liebler', 'LieblerLogin', false),
    new Player('Titts', 'lkdsaghf', false),
    new Player('PrivatePupu', 'nameZumLogin', false),
  ];

  constructor() {
    this.p.isReady = true;
    this.players.push(this.p);
  }

  defaultFunc() {}

  addplayer() {
    this.players.push(new Player('Peter Enis', 'lpeterenis', true));
  }

  removeplayer() {
    this.players.pop();
  }
}
