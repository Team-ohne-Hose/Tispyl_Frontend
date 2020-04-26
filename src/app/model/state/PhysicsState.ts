import {MapSchema, Schema, type} from '@colyseus/schema';
import {PhysicsEntity, PhysicsEntityVariation} from '../WsData';

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
  objectIDPhysics: number;
  @type(Vector)
  position: Vector = new Vector();
  @type(Quaternion)
  quaternion: Quaternion = new Quaternion();
  @type('number')
  entity: PhysicsEntity;
  @type('number')
  variant: PhysicsEntityVariation;
  @type('boolean')
  disabled = false;
}
export class PhysicsState extends Schema {
  @type({ map: PhysicsObjectState})
  objects = new MapSchema<PhysicsObjectState>();
}
