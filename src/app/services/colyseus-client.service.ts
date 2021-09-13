import { Injectable } from '@angular/core';
import { Client, Room, RoomAvailable } from 'colyseus.js';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { RoomMetaInfo } from '../model/RoomMetaInfo';
import { GameState } from '../model/state/GameState';
import { MessageType, WsData } from '../model/WsData';
import { DataChange } from '@colyseus/schema';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface MessageCallback {
  filterSubType: number; // -1/undefined for no filter, otherwise the subtype to filter for
  f: (data: WsData) => void;
}

export type ChangeCallback = (changes: DataChange<unknown>[]) => void;

export interface CreateRoomOpts {
  roomName: string;
  author: string;
  login: string;
  displayName: string;
  tileSetId: number;
  randomizeTiles: boolean;
  enableItems: boolean;
  enableMultipleItems: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ColyseusClientService {
  /** Constants and development parameters */
  private readonly VERBOSE_CALLBACK_LOGGING = true;
  private readonly BACKEND_WS_TARGET = environment.wsEndpoint;
  private readonly CLIENT: Client = new Client(this.BACKEND_WS_TARGET);

  /** Internal values */
  private registerSeed = 0;
  private changeCallbacks: Map<number, ChangeCallback> = new Map<number, ChangeCallback>();
  private messageCallbacks: Map<MessageType, Map<number, MessageCallback>> = new Map<
    MessageType,
    Map<number, MessageCallback>
  >([]);

  /** Access values mainly used by the state service */
  myLoginName: string;
  availableRooms$: BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>;
  activeRoom$: ReplaySubject<Room<GameState>>;

  constructor(private router: Router) {
    this.availableRooms$ = new BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>([]);
    this.activeRoom$ = new ReplaySubject<Room<GameState>>(1);

    /** Development logging */
    if (this.VERBOSE_CALLBACK_LOGGING) {
      for (let i = 0; i <= 12; i++) {
        this.registerMessageCallback(i, {
          filterSubType: -1,
          f: (data: WsData) => {
            this._logTypeAndMessage(i, data);
          },
        });
      }
    }

    /** Manage entering and leaving a room */
    this.activeRoom$.subscribe((r) => {
      console.info('[ColyseusService] Active Room changed to:', r);
      if (r !== undefined) {
        this._attachKnownMessageCallbacks(r);
        this._attachKnownChangeCallbacks(r);
      } else {
        if (this.VERBOSE_CALLBACK_LOGGING) {
          console.info('Known message callbacks after leaving the room:', this._prettyPrintMessageCallbacks());
          console.info('Known change callbacks after leaving the room:', this._prettyPrintChangeCallbacks());
        }
      }
    });
  }

  setActiveRoom(newRoom?: Room): void {
    this.activeRoom$.next(newRoom);
  }

  createRoom(opts: CreateRoomOpts): void {
    if (opts.roomName !== undefined) {
      this.CLIENT.create('game', opts).then((suc) => {
        this.setActiveRoom(suc);
        this.updateAvailableRooms();
        this.myLoginName = opts.login;
        this.router.navigateByUrl('/game');
      });
    }
  }

  joinActiveRoom(roomAva: RoomAvailable<RoomMetaInfo>, loginName: string, displayName: string): void {
    const options = {
      name: undefined,
      author: undefined,
      login: loginName,
      displayName: displayName,
    };
    this.CLIENT.joinById(roomAva.roomId, options).then((myRoom: Room) => {
      this.setActiveRoom(myRoom);
      this.myLoginName = loginName;
    });
  }

  updateAvailableRooms(): void {
    this.CLIENT.getAvailableRooms('game').then((rooms) => {
      this.availableRooms$.next(rooms);
    });
  }

  registerMessageCallback(mType: MessageType, cb: MessageCallback): number {
    const registerId = this._getUniqueId();
    const callbackMap: Map<number, MessageCallback> =
      this.messageCallbacks.get(mType) || new Map<number, MessageCallback>();
    callbackMap.set(registerId, cb);
    this.messageCallbacks.set(mType, callbackMap);
    return registerId;
  }

  clearMessageCallback(id: number): boolean {
    this.messageCallbacks.forEach((map) => {
      if (map.delete(id)) {
        return true;
      }
    });
    return false;
  }

  private _attachKnownMessageCallbacks(room: Room<GameState>): void {
    this.messageCallbacks.forEach((callbacks: Map<number, MessageCallback>, mType: MessageType) => {
      room.onMessage(mType, (msg) => {
        callbacks.forEach((cb) => cb.f(msg));
      });
    });
  }

  registerChangeCallback(cb: ChangeCallback): number {
    const registerId = this._getUniqueId();
    this.changeCallbacks.set(registerId, cb);
    return registerId;
  }

  clearChangeCallback(id: number): boolean {
    return this.changeCallbacks.delete(id);
  }

  private _getUniqueId(): number {
    this.registerSeed++;
    return this.registerSeed;
  }

  private _attachKnownChangeCallbacks(currentRoom: Room<GameState>): void {
    const bundledChangeFunctions = (changes: DataChange<unknown>[]) => {
      this.changeCallbacks.forEach((f) => f(changes));
    };
    currentRoom.state.onChange = bundledChangeFunctions.bind(this);
  }

  /** Debug and Development functions */
  private _logTypeAndMessage(mType: MessageType, data: WsData): void {
    console.info(`onMessage(${MessageType[mType]}[${mType}]) => ${JSON.stringify(data, null, 2)}`);
  }

  private _prettyPrintMessageCallbacks(): string {
    return (
      '\n' +
      Array.from(this.messageCallbacks.entries())
        .map((value) => {
          return (
            MessageType[value[0]] +
            ' => { \n' +
            Array.from(value[1].keys())
              .map((id) => '\t' + id + ' => f(...)')
              .join(',\n') +
            '\n}'
          );
        })
        .join(',\n\n')
    );
  }

  private _prettyPrintChangeCallbacks(): string {
    return (
      'onChange: {\n' +
      Array.from(this.changeCallbacks.keys())
        .map((id) => '\t' + id + ' => f(...)')
        .join(',\n') +
      '\n}'
    );
  }
}
