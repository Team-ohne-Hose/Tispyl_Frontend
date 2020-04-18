
import {Schema, type} from '@colyseus/schema';

export class GameState extends Schema {
  @type('number')
  round: number = 1;

  @type('string')
  turn: string = '';

  @type('string')
  action: string = 'roll';



  nextRound() {
    this.round += 1;
  }

  setRound( n: number ) {
    this.round = n;
  }
}
