import { Injectable } from '@angular/core';
import { ColyseusClientService, MessageCallback } from './colyseus-client.service';
import { Room } from 'colyseus.js';
import { ArraySchema, DataChange, MapSchema } from '@colyseus/schema';
import { GameState } from '../model/state/GameState';
import { Player } from '../model/state/Player';
import { PhysicsObjectState, PhysicsState } from '../model/state/PhysicsState';
import { BoardLayoutState, Tile } from '../model/state/BoardLayoutState';
import { MessageType } from '../model/WsData';
import { VoteStage, VoteState } from '../model/state/VoteState';
import { AsyncSubject, BehaviorSubject, Observable, Observer, ReplaySubject, Subject } from 'rxjs';
import { Rule } from '../model/state/Rule';
import { debounceTime, filter, map, mergeMap, take } from 'rxjs/operators';
import { GameStateAsObservables } from './colyseus-observable-state';
import { UserService } from './user.service';

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
  /** @deprecated */
  me$: AsyncSubject<Player> = new AsyncSubject<Player>();
  /** @deprecated */
  currentHostLogin$: Subject<string> = new Subject<string>();
  /** @deprecated */
  activePlayerLogin$: ReplaySubject<string> = new ReplaySubject<string>(1);
  /** @deprecated */
  activeAction$: ReplaySubject<string> = new ReplaySubject<string>(1);
  /** @deprecated */
  playerMap$: ReplaySubject<Map<string, Player>> = new ReplaySubject<Map<string, Player>>(1);
  // TODO: This is a one to one replacement for the old PlayerListUpdateCallback. This might be suboptimal. Please check actual calls to it.
  /** @deprecated */
  playerListChanges$: Subject<Player> = new Subject<Player>();
  /** @deprecated */
  isTurnOrderReversed$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** @deprecated */
  physicState$: ReplaySubject<PhysicsState> = new ReplaySubject<PhysicsState>(1);
  /** @deprecated */
  physicsObjectMoved$: Subject<PhysicsObjectState> = new Subject<PhysicsObjectState>();
  boardLayoutState$: ReplaySubject<BoardLayoutState> = new ReplaySubject<BoardLayoutState>(1);

  room$: ReplaySubject<Room<GameState>>;

  public observableState: GameStateAsObservables;

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

  constructor(private colyseus: ColyseusClientService, private userService: UserService) {
    this.room$ = this.colyseus.activeRoom$;
    this.observableState = this.colyseus.getStateAsObservables();

    this.observableState.currentPlayerLogin$.subscribe((currentPlayerLogin: string) => {
      console.log('nextTurn detected. notifying callbacks');
      this.activePlayerLogin$.next(currentPlayerLogin);
    });
    this.observableState.action$.subscribe((action: string) => {
      console.log('nextAction detected');
      this.activeAction$.next(action);
    });
    this.observableState.playerList$.subscribe((playerList: MapSchema<Player>) => {
      console.log('playerList update detected', playerList);
      this.playerMap$.next(playerList);
      if (!this.me$.isStopped) {
        this.me$.next(this._resolveMyPlayerObject(playerList));
        this.me$.complete();
      }
    });
    this.observableState.playerChange$.subscribe((player: Player) => {
      console.log('Player update detected', player);
    });
    this.observableState.hostLoginName$.subscribe((hostLoginName: string) => {
      console.log('hostLoginName update detected');
      this.currentHostLogin$.next(hostLoginName);
    });
    this.observableState.reversed$.subscribe((reversed: boolean) => {
      console.log('reversed update detected');
      this.isTurnOrderReversed$.next(reversed);
    });

    this.observableState.playerList$.subscribe((playerList: MapSchema<Player>) => {
      this.playerMap$.next(playerList);
    });
    this.observableState.playerChange$.subscribe((player: Player) => {
      this.playerListChanges$.next(player);
    });
    this.observableState.physicsState.objectsMoved$.subscribe((pObj: PhysicsObjectState) => {
      this.physicsObjectMoved$.next(pObj);
    });

    /** Listen to Room changes ( entering / switching / leaving ) */
    colyseus.activeRoom$.subscribe((room: Room<GameState>) => {
      if (room !== undefined) {
        this.room = room;
        room.onStateChange.once((state: GameState) => {
          console.info('[GameStateService] Initial GameState was provided. Synchronizing service access values.');
          this._synchronizeToRoomState(state);
        });
      } else {
        console.info(`[GameStateService] Room changed to ${room}. This should only happen when a game is left.`);
        this.isRoomDataAvailable$.next(false);
      }
    });
  }

  private _synchronizeToRoomState(state: GameState) {
    /** the initial values for all access values should be set once here. */ // TODO: Confirm that all needed values are set
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
        console.log('isMyTurn$', activeLogin);
        return this.me$.pipe(
          map((me: Player) => {
            console.log('isMyTurn$->me', me.loginName);
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

  getMe$(): Observable<Player> {
    return this.observableState.playerChange$
      .pipe(filter((p: Player) => p.loginName === this.userService.activeUser.getValue().login_name))
      .pipe(debounceTime(0));
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
}
