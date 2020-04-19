
import {Schema, MapSchema, type} from '@colyseus/schema';


export class Player extends Schema {
  @type('string')
  displayName: string;
}

export class GameState extends Schema {
  @type('number')
  round: number = 1;

  @type('string')
  turn: string = '';

  @type('string')
  action: string = 'roll';

  @type({map: Player})
  playerList = new MapSchema<Player>();

  nextRound() {
    this.round += 1;
  }

  setRound( n: number ) {
    this.round = n;
  }

  private asArray<T>(map: MapSchema<T>): T[] {
    const tmpArray: T[] = [];
    for (const id in map) {
      tmpArray.push(map[id]);
    }
    return tmpArray;
  }
}
