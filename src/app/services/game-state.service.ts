import { Injectable } from '@angular/core';
import { ColyseusClientService, MessageCallback } from './colyseus-client.service';
import { Room } from 'colyseus.js';
import { DataChange, MapSchema, ArraySchema } from '@colyseus/schema';
import { GameState } from '../model/state/GameState';
import { Player } from '../model/state/Player';
import { PhysicsObjectState, PhysicsState } from '../model/state/PhysicsState';
import { BoardLayoutState, Tile } from '../model/state/BoardLayoutState';
import { MessageType } from '../model/WsData';
import { VoteStage, VoteState } from '../model/state/VoteState';
import { VoteEntry } from '../components/game/interface/menu-bar/vote-system/helpers/VoteEntry';
import { AsyncSubject, BehaviorSubject, Observable, Observer, ReplaySubject, Subject } from 'rxjs';
import { Rule } from '../model/state/Rule';
import { map, mergeMap, take } from 'rxjs/operators';

/**
 * This class provides an interface to the colyseus data. It provides structures which
 * fit better to the needs when in-game. All values should be (made) available as Observables.
 *
 * @note A subscription to an Observable will stick around until either the Observable completes
 * or the subscriber unsubscribes. Thus many values have a two access functions. One returning
 * the observable and one returning a single-use Observable that wil automatically unsubscribe
 * after one value was received. The later are marked with the key word 'Once'.
 */
@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  /** Scheduling values for the loading process */
  isRoomDataAvailable$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  /** Access values for the game state */
  me$: AsyncSubject<Player> = new AsyncSubject<Player>();
  currentHostLogin$: Subject<string> = new Subject<string>();
  activePlayerLogin$: ReplaySubject<string> = new ReplaySubject<string>(1);
  activeAction$: ReplaySubject<string> = new ReplaySubject<string>(1);
  playerMap$: BehaviorSubject<Map<string, Player>> = new BehaviorSubject<Map<string, Player>>(new Map());
  // TODO: This is a one to one replacement for the old PlayerListUpdateCallback. This might be suboptimal. Please check actual calls to it.
  playerListChanges$: Subject<Player> = new Subject<Player>();
  isTurnOrderReversed$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  physicState$: ReplaySubject<PhysicsState> = new ReplaySubject<PhysicsState>(1);
  physicsObjectMoved$: Subject<PhysicsObjectState> = new Subject<PhysicsObjectState>();
  boardLayoutState$: ReplaySubject<BoardLayoutState> = new ReplaySubject<BoardLayoutState>(1);

  room$: ReplaySubject<Room<GameState>>;

  /** @deprecated Room access object should not be used anymore as it is prone to inconsistencies */
  private room: Room<GameState>;

  /** Deprecated callback functions */
  /** @deprecated */
  private voteStageCallbacks: ((stage: VoteStage) => void)[] = [];
  /** @deprecated */
  private voteCastCallbacks: (() => void)[] = [];
  /** @deprecated */
  private voteSystemCallbacks: ((change: DataChange[]) => void)[] = [];
  /** @deprecated */
  private itemCallbacks: (() => void)[] = [];

  constructor(private colyseus: ColyseusClientService) {
    this.room$ = this.colyseus.activeRoom$;

    this.colyseus.registerChangeCallback((changes: DataChange<GameState>[]) => {
      changes.forEach((change: DataChange) => {
        switch (change.field) {
          case 'currentPlayerLogin':
            console.debug('nextTurn detected. notifying callbacks');
            this.activePlayerLogin$.next(change.value);
            break;
          case 'action':
            this.activeAction$.next(change.value);
            break;
          case 'playerList': {
            const m = change.value as MapSchema<Player>;
            this.playerMap$.next(m);

            if (!this.me$.isStopped) {
              this.me$.next(this._resolveMyPlayerObject(m));
              this.me$.complete();
            }
            break;
          }
          case 'hostLoginName':
            this.currentHostLogin$.next(change.value);
            break;
          case 'reversed':
            this.isTurnOrderReversed$.next(change.value);
            break;
        }
      });
    });

    /** Listen to Room changes ( entering / switching / leaving ) */
    colyseus.activeRoom$.subscribe((room: Room<GameState>) => {
      if (room !== undefined) {
        this.room = room;
        room.onStateChange.once((state: GameState) => {
          console.info('[GameStateService] Initial GameState was provided. Synchronizing service access values.');
          this._synchronizeToRoomState(state);
          this._attachCallbacks(room);
        });
      } else {
        console.info(`[GameStateService] Room changed to ${room}. This should only happen when a game is left.`);
        this.isRoomDataAvailable$.next(false);
      }
    });
  }

  private _synchronizeToRoomState(state: GameState) {
    /** the initial values for all access values should be set once here. */ // TODO: Confirm that all needed values are set
    this.physicState$.next(state.physicsState);
    state.physicsState.objects.forEach((o: PhysicsObjectState) => this.physicsObjectMoved$.next(o));
    this.boardLayoutState$.next(state.boardLayout);
    this.boardLayoutState$.complete();
    this.isRoomDataAvailable$.next(true);
  }

  private _resolveMyPlayerObject(players: MapSchema<Player>): Player {
    return Array.from(players.values()).find((p: Player) => {
      return p.loginName === this.colyseus.myLoginName;
    });
  }

  roomOnce$(): Observable<Room<GameState>> {
    return this.room$.pipe(take(1));
  }

  amIHost$(): Observable<boolean> {
    return this.currentHostLogin$.pipe(
      mergeMap((hostLogin: string) => {
        return this.me$.pipe(map((me: Player) => hostLogin === me.loginName));
      })
    );
  }

  /**
   * @deprecated The room state should not be accessed directly anymore. Use either a wrapper function providing
   * a fitting Observable<T> in the GameStateService or access the ColyseusService.activeRoom$ Observable
   */
  getState(): GameState {
    const room = this.room;
    if (room === undefined || room.state === undefined) {
      return undefined;
    } else {
      return room.state;
    }
  }

  isMyTurn$(): Observable<boolean> {
    return this.activePlayerLogin$.pipe(
      mergeMap((activeLogin: string) => {
        return this.me$.pipe(
          map((me: Player) => {
            return me.loginName === activeLogin;
          })
        );
      })
    );
  }

  isMyTurnOnce$(): Observable<boolean> {
    return this.isMyTurn$().pipe(take(1));
  }

  getMyLoginName(): string {
    return this.colyseus.myLoginName;
  }

  getMyFigureId(): number {
    const p: Player = this.getByLoginName(this.colyseus.myLoginName);
    return p.figureId;
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  findInPlayerList(f: (p: Player) => boolean): Player {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return Array.from(s.playerList.values()).find(f);
    }
  }

  getMe(): Player {
    return this.getByLoginName(this.colyseus.myLoginName);
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getCurrentPlayer(): Player {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return this.getByLoginName(s.currentPlayerLogin);
    }
    return undefined;
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getCurrentPlayerLogin(): string {
    const p: Player = this.getCurrentPlayer();
    if (p !== undefined) {
      return p.loginName;
    }
    return '';
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getCurrentPlayerDisplayName(): string {
    const p: Player = this.getCurrentPlayer();
    if (p !== undefined) {
      return p.displayName;
    }
    return '';
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getByLoginName(loginName: string): Player {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return s.playerList.get(loginName);
    }
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getByDisplayName(displayName: string): Player {
    return this.findInPlayerList((p: Player) => {
      return p.displayName === displayName;
    });
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getDisplayName(playerlogin: string): string {
    const p: Player = this.getByLoginName(playerlogin);
    if (p !== undefined) {
      return p.displayName;
    }
    return undefined;
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getLoginName(playerDisplayName: string): string {
    const p: Player = this.getByDisplayName(playerDisplayName);
    if (p !== undefined) {
      return p.loginName;
    }
    return undefined;
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getRound(): number {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return s.round;
    }
    return 0;
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getAction(): string {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return s.action;
    }
    return undefined;
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  hasStarted(): boolean {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return s.hasStarted;
    }
    return false;
  }

  getPlayerArray$(): Observable<Player[]> {
    return this.playerMap$.pipe(
      map((m: Map<string, Player>) => {
        return Array.from(m.values());
      })
    );
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getPlayerArray(): Player[] {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return Array.from(s.playerList.values());
    }
    return [];
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  forEachPlayer(f: (p: Player) => void): void {
    const s: GameState = this.getState();
    s?.playerList?.forEach(f);
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getRules(): ArraySchema<Rule> | undefined {
    const s: GameState = this.getState();
    return s?.rules;
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getVoteState(): VoteState | undefined {
    const s: GameState = this.getState();
    return s?.voteState;
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getPhysicsState(): PhysicsState | undefined {
    const s = this.getState();
    return s?.physicsState;
  }

  getBoardLayoutAsArray(): Observable<Tile[]> {
    return new Observable<Tile[]>((o: Observer<Tile[]>) => {
      this.boardLayoutState$.pipe(take(1)).subscribe((state: BoardLayoutState) => {
        const tiles: Tile[] = [];
        for (let i = 0; i < 64; i++) {
          tiles.push(state.tileList.get(String(i)));
        }
        o.next(tiles);
        o.complete();
      });
    });
  }

  sendMessage(type: number | string, data: unknown): void {
    this.roomOnce$().subscribe((r) => {
      r.send(type, data);
    });
  }

  addVoteStageCallback(f: (stage: VoteStage) => void): void {
    this.voteStageCallbacks.push(f);
  }

  addVoteCastCallback(f: () => void): void {
    this.voteCastCallbacks.push(f);
  }

  addVoteSystemCallback(f: (change: DataChange[]) => void): void {
    this.voteSystemCallbacks.push(f);
  }

  addItemUpdateCallback(f: () => void): void {
    this.itemCallbacks.push(f);
  }

  registerMessageCallback(type: MessageType, cb: MessageCallback): number {
    return this.colyseus.registerMessageCallback(type, cb);
  }

  clearMessageCallback(id: number): boolean {
    return this.colyseus.clearMessageCallback(id);
  }

  private _attachPlayerCallbacks(room: Room<GameState>): void {
    if (room.state.playerList === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, Playerlist was undefined');
    } else {
      const addPlayerCbs = (p: Player, key: string) => {
        p.onChange = ((changes: DataChange[]) => {
          this._callPlayerListUpdate(p, key);
          this.playerMap$.next(this.playerMap$.value.set(key, p));
        }).bind(this);
      };
      room.state.playerList.onAdd = (p: Player, key: string) => {
        addPlayerCbs(p, key);
        this._callPlayerListUpdate(p, key);
        this.playerMap$.next(this.playerMap$.value.set(key, p));
      };
      room.state.playerList.forEach((p: Player, key: string) => {
        addPlayerCbs(p, key);
        this._callPlayerListUpdate(p, key);
      });
      room.state.playerList.onRemove = (p: Player, key: string) => {
        addPlayerCbs(p, key);
        this._callPlayerListUpdate(p, key);
        const m = this.playerMap$.value;
        m.delete(key);
        this.playerMap$.next(m);
      };
    }
  }

  private _attachPhysicsMovedCallbacks(room: Room<GameState>): void {
    if (room.state.physicsState === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, PhysicsState was undefined');
    } else if (room.state.physicsState.objects === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, PhysicsState.objects was undefined');
    } else {
      console.debug('PhysicsUpdates attached', room, room.state, room.state.physicsState.objects);
      const attachMovedCallbacks = (pObj: PhysicsObjectState, key: string) => {
        console.debug('attached onChange Callback to physics object', pObj);
        pObj.position.onChange = ((changes: DataChange[]) => {
          this._callPhysicsObjectMoved(pObj, key);
        }).bind(this);
        pObj.quaternion.onChange = ((changes: DataChange[]) => {
          this._callPhysicsObjectMoved(pObj, key);
        }).bind(this);
      };
      room.state.physicsState.objects.forEach(attachMovedCallbacks.bind(this));
      room.state.physicsState.objects.onAdd = ((item, key) => {
        console.debug('onAdd triggered', item, key);
        attachMovedCallbacks(item, key);
        this._callPhysicsObjectMoved(item, key);
      }).bind(this);
    }
  }

  private _attachVoteStateCallbacks(room: Room<GameState>): void {
    if (room.state.voteState === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, voteState was undefined');
    } else {
      room.state.voteState.onChange = this._callVoteStageUpdate.bind(this);
    }
  }

  private _attachVoteCastCallback(): void {
    if (this.room?.state?.voteState?.voteConfiguration === undefined) {
      console.warn(
        'GameStateService tried to attach callbacks for casting votes. Something was not defined. Room is:',
        this.room
      );
      return;
    }
    // this should get called everytime a new Vote is started.
    // it attaches the callVoteCastUpdate to every voting option. For every casted/changed vote, the old entry is removed and a new entry
    // in the corresponding option is added for the player, which just casted the vote. Therefore the onAdd callback should be sufficient.
    this.room.state.voteState.voteConfiguration.votingOptions.forEach((entry: VoteEntry) => {
      entry.castVotes.onAdd = this._callVoteCastUpdate.bind(this);
    });
  }

  private _attachItemCallback(room: Room<GameState>): void {
    const playerMe: Player = this.getMe();
    if (playerMe?.itemList === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, playerMe or its ItemList was undefined');
    } else {
      // onChange works only on Arrays/Maps of primitives. But ItemList is a primitive
      playerMe.itemList.onChange = this._callItemUpdate.bind(this);
      playerMe.itemList.onAdd = this._callItemUpdate.bind(this);
      playerMe.itemList.onRemove = this._callItemUpdate.bind(this);
    }
  }

  private _attachCallbacks(room: Room<GameState>): void {
    if (room === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, Room was undefined!');
    } else {
      this._attachPlayerCallbacks(room);
      this._attachPhysicsMovedCallbacks(room);
      this._attachVoteStateCallbacks(room);
      this._attachItemCallback(room);
      console.debug('attached GameStateServiceCallbacks');
    }
  }

  private _callPlayerListUpdate(player: Player, key: string): void {
    this.playerListChanges$.next(player);
  }

  private _callPhysicsObjectMoved(item: PhysicsObjectState, key: string): void {
    this.physicsObjectMoved$.next(item);
  }

  private _callVoteStageUpdate(changes: DataChange[]): void {
    const newVal: VoteStage = changes.find((change: DataChange) => change.field === 'voteStage')?.value;
    if (newVal !== undefined) {
      this.voteStageCallbacks.forEach((f) => f(newVal));
    }
    if (newVal === VoteStage.VOTE) {
      this._attachVoteCastCallback();
    }
    this.voteSystemCallbacks.forEach((f) => f(changes.filter((v: DataChange) => v.field !== 'voteStage')));
  }

  private _callVoteCastUpdate(): void {
    this.voteCastCallbacks.forEach((f) => f());
  }

  private _callItemUpdate(): void {
    this.itemCallbacks.forEach((f) => f());
  }
}
