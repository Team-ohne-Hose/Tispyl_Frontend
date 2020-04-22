import {Injectable} from '@angular/core';
import {Client, Room, RoomAvailable} from 'colyseus.js';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {RoomMetaInfo} from '../model/RoomMetaInfo';
import {GameState} from '../model/GameState';
import {MessageType, PhysicsCommandType, WsData} from '../model/WsData';
import {DataChange} from '@colyseus/schema';

export interface MessageCallback {
  filterSubType: number; // -1/undefined for no filter, otherwise the subtype to filter for
  f: (data: WsData) => void;
}
@Injectable({
  providedIn: 'root'
})
export class ColyseusClientService {

  sessionId: string = undefined;
  private port = '2567';
  private backendWStarget = 'ws://localhost:' + this.port;

  private client: Client = new Client(this.backendWStarget);
  private activeRoom: BehaviorSubject<Room<GameState>>;
  private availableRooms: BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>;

  private messageCallbacks: Map<MessageType, MessageCallback[]> = new Map<MessageType, MessageCallback[]>([
    [MessageType.CHAT_MESSAGE, [{filterSubType: undefined, f: this.defaultCallback}]],
    [MessageType.PHYSICS_MESSAGE, [{filterSubType: PhysicsCommandType.addEntity, f: this.defaultCallback}]]
    ]);
  private onChangeCallbacks: ((changes: DataChange<any>[]) => void)[] = [];


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

  setActiveRoom(newRoom?: Room): void {
    if (newRoom !== undefined) {
      this.updateRoomCallbacks(newRoom);
      this.sessionId = newRoom.sessionId;
    }
    this.activeRoom.next(newRoom);
  }

  joinActiveRoom(roomAva: RoomAvailable<RoomMetaInfo>, options?: any) {
    this.client.joinById(roomAva.roomId, options).then((myRoom: Room) => {
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

  registerMessageCallback(type: MessageType, cb: MessageCallback) {
    let cbList: MessageCallback[] = this.messageCallbacks.get(type);
    if (cbList === undefined) {
      cbList = [cb];
      this.messageCallbacks.set(type, cbList);
    } else {
      cbList.push(cb);
    }
  }

  /**
   * Will distribute WsData to callbacks based on the WsData type.
   * @note: Excluded from directly being located inside the "updateRoomCallbacks()" to avoid function nesting.
   * @param data passed on to the callbacks based on its type value.
   */
  private gatherFunctionCalls(data: WsData): void {
    const type: MessageType = data.type;
    const list: MessageCallback[] = this.messageCallbacks.get(type);
    if (list !== undefined && list.length > 0) {
      list.forEach((value: MessageCallback, index: number) => {
        if (value.filterSubType >= 0) {
          if (data['subType'] === value.filterSubType) {
            value.f(data);
          }
        } else {
          value.f(data);
        }
      });
    }
  }

  addOnChangeCallback(cb: (changes: DataChange<any>[]) => void) {
    this.onChangeCallbacks.push(cb);
  }
  private distributeOnChange(changes: DataChange<any>[]) {
    this.onChangeCallbacks.map(f => f(changes));
  }

  updateRoomCallbacks(currentRoom?: Room<GameState>) {
    const onMsg = this.gatherFunctionCalls.bind(this);
    if ( currentRoom === undefined ) {
      this.getActiveRoom().subscribe((activeRoom) => {
        if (activeRoom !== undefined) {
          activeRoom.onMessage(onMsg);
          activeRoom.state.onChange = this.distributeOnChange.bind(this);
        }
      });
    } else {
      currentRoom.onMessage(onMsg);
      currentRoom.state.onChange = this.distributeOnChange.bind(this);
    }
  }

}
