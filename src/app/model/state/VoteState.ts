import { Schema, type } from '@colyseus/schema';
import { VoteConfiguration } from '../../components/game/interface/menu-bar/vote-system/helpers/VoteConfiguration';


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

  @type(VoteConfiguration)
  voteConfiguration: VoteConfiguration = undefined;

  @type('number')
  closingIn: number = -1;
}

