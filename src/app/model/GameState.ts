
import {Schema, MapSchema, type} from '@colyseus/schema';

export class Player extends Schema {
  @type('string')
  displayName: string;
  @type('boolean')
  isCurrentHost: boolean;
  @type('boolean')
  isReady: boolean;
}

export class Vector extends Schema {
  @type('number')
  x: number;
  @type('number')
  y: number;
  @type('number')
  z: number;
}
export class Quaternion extends Schema {
  @type('number')
  x: number;
  @type('number')
  y: number;
  @type('number')
  z: number;
  @type('number')
  w: number;
}
export class PhysicsObjectState extends Schema {
  @type('number')
  objectIDTHREE: number;
  @type(Vector)
  position: Vector = new Vector();
  @type(Quaternion)
  quaternion: Quaternion = new Quaternion();
}
export class PhysicsState extends Schema {
  @type({ map: PhysicsObjectState})
  objects = new MapSchema<PhysicsObjectState>();
}
export class GameState extends Schema {
  @type('number')
  round = 1;

  @type('string')
  turn = '';

  @type('string')
  action = 'roll';

  @type({map: Player})
  playerList = new MapSchema<Player>();

  @type('string')
  hostSession = '';

  @type('boolean')
  hasStarted: boolean = false;

  @type(PhysicsState)
  physicsState = new PhysicsState();

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
