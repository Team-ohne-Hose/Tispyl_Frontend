import { Injectable, OnDestroy } from '@angular/core';
import { Client, Room, RoomAvailable } from 'colyseus.js';
import { BehaviorSubject, ReplaySubject, Subscription, take } from 'rxjs';
import { RoomMetaInfo } from '../model/RoomMetaInfo';
import { GameState } from '../model/state/GameState';
import { MessageType, WsData } from '../model/WsData';
import { DataChange } from '@colyseus/schema';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ColyseusObservableState, GameStateAsObservables } from './colyseus-observable-state';

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
export class ColyseusClientService implements OnDestroy {
  /** Constants and development parameters */
  private readonly VERBOSE_CALLBACK_LOGGING = false;
  private readonly BACKEND_WS_TARGET = environment.wsEndpoint;
  private readonly CLIENT: Client = new Client(this.BACKEND_WS_TARGET);

  /** Internal values */
  private registerSeed = 0;
  private attachedOnce = false;
  private changeCallbacks: Map<number, ChangeCallback> = new Map<number, ChangeCallback>();
  private messageCallbacks: Map<MessageType, Map<number, MessageCallback>> = new Map<MessageType, Map<number, MessageCallback>>([]);

  /** Access values mainly used by the state service */
  myLoginName$: ReplaySubject<string> = new ReplaySubject<string>(1);
  availableRooms$: BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>;
  activeRoom$: ReplaySubject<Room<GameState>>;

  private observableState: ColyseusObservableState;

  // subscriptions
  private activeRoom$$: Subscription;

  constructor(private router: Router) {
    this.availableRooms$ = new BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>([]);
    this.activeRoom$ = new ReplaySubject<Room<GameState>>(1);
    this.observableState = new ColyseusObservableState(this.activeRoom$);

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
    this.activeRoom$$ = this.activeRoom$.subscribe((r) => {
      console.info('[ColyseusService] Active Room changed to:', r);
      if (r !== undefined) {
        this._attachKnownMessageCallbacks(r);
        this.attachedOnce = true;
      } else {
        if (this.VERBOSE_CALLBACK_LOGGING) {
          console.info('Known message callbacks after leaving the room:', this._prettyPrintMessageCallbacks());
          console.info('Known change callbacks after leaving the room:', this._prettyPrintChangeCallbacks());
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.activeRoom$$.unsubscribe();
    this.observableState.onDestroy();
  }

  getStateAsObservables(): GameStateAsObservables {
    return this.observableState.gameState;
  }

  setActiveRoom(newRoom?: Room): void {
    this.activeRoom$.next(newRoom);
  }

  createRoom(opts: CreateRoomOpts): void {
    if (opts.roomName !== undefined) {
      console.info('Creating room with settings:', opts);
      this.CLIENT.create('game', opts).then((suc) => {
        this.setActiveRoom(suc);
        this.updateAvailableRooms();
        this.myLoginName$.next(opts.login);
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
      this.myLoginName$.next(loginName);
    });
  }

  updateAvailableRooms(): void {
    this.CLIENT.getAvailableRooms('game').then((rooms) => {
      this.availableRooms$.next(rooms);
    });
  }

  registerMessageCallback(mType: MessageType, cb: MessageCallback): number {
    const registerId = this._getUniqueId();
    const callbackMap: Map<number, MessageCallback> = this.messageCallbacks.get(mType) || new Map<number, MessageCallback>();
    callbackMap.set(registerId, cb);
    this.messageCallbacks.set(mType, callbackMap);

    const isNewMType = this.messageCallbacks.get(mType).size == 1;
    if (this.attachedOnce && isNewMType) {
      // May not need to be a warning as this could be desired
      console.warn(`Delayed attachment detected for type: ${MessageType[mType]} (${mType})`);
      this.activeRoom$.pipe(take(1)).subscribe((r: Room<GameState>) => {
        r.onMessage(mType, (msg) => {
          this.messageCallbacks.get(mType).forEach((cb) => cb.f(msg));
        });
      });
    }
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

  private _getUniqueId(): number {
    this.registerSeed++;
    return this.registerSeed;
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
