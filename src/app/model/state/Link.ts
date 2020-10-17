
import { Schema, ArraySchema, type } from '@colyseus/schema';

export class Link extends Schema {

  @type('string')
  source: string;

  @type('string')
  target: string;

}
