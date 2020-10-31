import {Schema, ArraySchema, MapSchema, type} from '@colyseus/schema';
import {VoteConfiguration} from '../../game/interface/vote-system/VoteConfiguration';

export class VoteState extends Schema {

  @type('boolean')
  creationInProgress = true;

  @type('string')
  author = '';

  @type( VoteConfiguration )
  activeVoteConfiguration: VoteConfiguration = undefined;

  @type('number')
  closingIn: number = -1;
}

