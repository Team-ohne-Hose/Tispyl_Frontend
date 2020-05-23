import {Schema, ArraySchema, MapSchema, type} from '@colyseus/schema';

export class Vote extends Schema {
  @type('string')
  loginName = '';
  @type('string')
  vote = '';
}
export class VoteState extends Schema {
  @type('boolean')
  idle = true;
  @type('string')
  author = '';
  @type({map: Vote})
  votes = new MapSchema<Vote>();
  @type(['string'])
  eligibleLoginNames = new ArraySchema<string>();
  @type('boolean')
  isCustom = false;
  @type( ['string'] )
  customOptions = new ArraySchema<string>();
  constructor() {
    super();
  }
}
