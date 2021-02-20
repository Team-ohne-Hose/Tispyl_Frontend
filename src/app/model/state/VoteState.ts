import {Schema, ArraySchema, MapSchema, type} from '@colyseus/schema';
import {VoteConfiguration} from '../../game/interface/vote-system/VoteConfiguration';


export enum VoteStage {
  IDLE = 1,
  CREATION,
  VOTE
}

export class VoteState extends Schema {

  @type('string')
  author = '';

  @type('number')
  voteStage: number = VoteStage.IDLE;

  @type( VoteConfiguration )
  activeVoteConfiguration: VoteConfiguration = undefined;

  @type('number')
  closingIn: number = -1;
}

