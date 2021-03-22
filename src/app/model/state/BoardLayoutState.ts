import { Schema, MapSchema, type } from '@colyseus/schema';

export class Tile extends Schema {
  @type('number')
  tileId: number;
  @type('string')
  imageUrl: string;
  @type('string')
  translationKey: string;
  @type('string')
  description: string;
}

export class BoardLayoutState extends Schema {
  @type({map: Schema})
  tileList = new MapSchema<Tile>();
}
