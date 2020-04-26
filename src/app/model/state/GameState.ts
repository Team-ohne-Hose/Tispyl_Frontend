import {Schema, ArraySchema, MapSchema, type} from '@colyseus/schema';
import {PhysicsState} from './PhysicsState';
import {Player} from './Player';

enum Actions {
  ROLL,
  MOVE,
  EXECUTE
}
export class GameState extends Schema {

  @type('number')
  round = 0;

  @type('string')
  action: string = Actions[Actions.EXECUTE];

  @type('string')
  hostLoginName = '';

  @type('boolean')
  hasStarted = false;

  @type(PhysicsState)
  physicsState = new PhysicsState();

  @type({map: Player})
  playerList = new MapSchema<Player>();

  @type([ 'string' ])
  rules = new ArraySchema<string>();

  @type('string')
  currentPlayerLogin: string;
}
