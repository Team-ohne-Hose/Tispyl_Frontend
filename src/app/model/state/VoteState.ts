import {Schema, ArraySchema, MapSchema, type} from '@colyseus/schema';
import {VoteConfiguration} from '../../game/interface/vote-system/VoteConfiguration';


export enum VoteStage {
  IDLE = 1,
  CREATION = 2,
  VOTE = 3
}

export class VoteState extends Schema {

  @type('string')
  author = 'undefined';

  @type('number')
  voteStage: number = VoteStage.IDLE;

  @type( VoteConfiguration )
  voteConfiguration: VoteConfiguration = undefined;

  @type('number')
  closingIn: number = -1;
}

