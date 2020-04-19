import { Injectable } from '@angular/core';
import {Client, Room, RoomAvailable} from 'colyseus.js';
import {BehaviorSubject, Observable} from 'rxjs';
import {RoomMetaInfo} from '../model/RoomMetaInfo';
import {room} from 'colyseus.js/lib/sync/helpers';
import {GameState} from '../model/GameState';
import {ChatMessage, WsData} from '../model/WsData';
import {Schema, DataChange} from '@colyseus/schema';



@Injectable({
  providedIn: 'root'
})
export class ColyseusClientService {

  private port = '2567';
  private backendWStarget = 'ws://localhost:' + this.port;

  private client: Client = new Client(this.backendWStarget);
  private activeRoom: BehaviorSubject<Room<GameState>>;
  private availableRooms: BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>;

  private callbacks: Map<string, (WsData) => void> = new Map([
    ['onChatMessage', this.defaultCallback]
  ]);


  constructor() {
    this.activeRoom = new BehaviorSubject<Room<GameState>>(undefined);
    this.availableRooms = new BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>([]);
  }

  getClient(): Client {
    return this.client;
  }

  getActiveRoom(): Observable<Room<GameState>> {
    return this.activeRoom.asObservable();
  }

  setActiveRoom(newRoom): void {
    if (newRoom !== undefined) {
      this.updateRoomCallbacks(newRoom);
    }
    this.activeRoom.next(newRoom);
  }

  joinActiveRoom(roomAva: RoomAvailable<RoomMetaInfo>, options?: any) {
    this.client.joinById(roomAva.roomId, options).then((myRoom) => {
      this.setActiveRoom(myRoom);
    });
  }

  watchAvailableRooms(): Observable<RoomAvailable<RoomMetaInfo>[]> {
    return this.availableRooms.asObservable();
  }

  updateAvailableRooms(): void {
    this.client.getAvailableRooms('game').then( rooms => {
      this.availableRooms.next(rooms);
    });
  }

  hostGame(opt): void {
    this.client.create('game', opt).then( suc => {
      this.setActiveRoom(suc);
    });
  }

  private defaultCallback(data: WsData) {
    console.warn('A server message was not addressed. Call back was undefined', data.type, data);
  }


  registerCallBack(key: string, newCb: (WsData) => void): boolean {
    const currentCb = this.callbacks.get(key);
    if ( currentCb !== undefined ) {
      if ( currentCb !== this.defaultCallback ) {
        console.warn(`Overridden an existing callback with key: ${key}`);
      }
      const previousValues = Object.assign({}, this.callbacks);
      this.callbacks.set(key, newCb);
      if ( this.callbacks === previousValues ) {
        console.warn('Callback registration did not alter any values.');
        return false;
      } else {
        return true;
      }
    } else {
      console.warn(`Failed to register a callback (${key} was no known callback identifier) : `, newCb);
      return false;
    }
  }

  /**
   * Will distribute WsData to callbacks based on the WsData type in the Future.
   * @note: Excluded from directly being located inside the "updateRoomCallbacks()" to avoid function nesting.
   * @param data passed on to the callbacks based on its type value.
   */
  private gatherFunctionCalls(data: WsData): void {
    [
      this.callbacks.get('onChatMessage')
    ].map(f => f(data));
  }


  updateRoomCallbacks(currentRoom?: Room<GameState>) {
    const onMsg = this.gatherFunctionCalls.bind(this);
    if ( currentRoom === undefined ) {
      this.getActiveRoom().subscribe((activeRoom) => {
        if (activeRoom !== undefined) {
          activeRoom.onMessage(onMsg);
        }
      });
    } else {
      currentRoom.onMessage(onMsg);
    }
  }

}
