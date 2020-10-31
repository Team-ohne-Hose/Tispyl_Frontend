import {MapSchema, Schema, type} from '@colyseus/schema';
import {PlayerModel} from '../WsData';

export class Player extends Schema {
  @type('string')
  displayName: string;
  @type('string')
  clientId: string;
  @type('string')
  loginName: string;
  @type('boolean')
  isCurrentHost: boolean;
  @type('boolean')
  isReady: boolean;
  @type('number')
  figureId: number;
  @type('number')
  figureModel: PlayerModel;
  @type('number')
  currentTile: number;
  @type('boolean')
  isConnected: boolean;
  @type('boolean')
  hasLeft: boolean;
  @type( {map: 'number'} )
  itemList: MapSchema<number>;

  constructor(displayName: string, loginName: string, isCurrentHost: boolean) {
    super();
    this.displayName = displayName;
    this.loginName = loginName;
    this.isCurrentHost = isCurrentHost;
  }
}
