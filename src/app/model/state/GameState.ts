import { Schema, ArraySchema, MapSchema, type } from '@colyseus/schema';
import { PhysicsState } from './PhysicsState';
import { Player } from './Player';
import { BoardLayoutState } from './BoardLayoutState';
import { VoteState } from './VoteState';
import { Link } from './Link';
import { Rule } from './Rule';

export enum Actions {
  ROLL,
  MOVE,
  EXECUTE,
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

  @type({ map: Player })
  playerList = new MapSchema<Player>();

  @type([Rule])
  rules = new ArraySchema<Rule>();

  @type([Link])
  drinkBuddyLinks = new ArraySchema<Link>();

  @type('string')
  currentPlayerLogin: string;

  @type(BoardLayoutState)
  boardLayout: BoardLayoutState;

  @type('boolean')
  reversed = false;

  @type(VoteState)
  voteState: VoteState = new VoteState();
}
