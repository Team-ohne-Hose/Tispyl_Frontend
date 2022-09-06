import { Injectable } from '@angular/core';
import { ColyseusClientService, MessageCallback } from './colyseus-client.service';
import { Room } from 'colyseus.js';
import { MapSchema } from '@colyseus/schema';
import { GameState } from '../model/state/GameState';
import { Player } from '../model/state/Player';
import { PhysicsObjectState } from '../model/state/PhysicsState';
import { Tile } from '../model/state/BoardLayoutState';
import { MessageType } from '../model/WsData';
import { AsyncSubject, BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { combineLatestWith, debounceTime, filter, map, mergeMap, take } from 'rxjs/operators';
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
  physicsObjectMoved$: Subject<PhysicsObjectState> = new Subject<PhysicsObjectState>();

  room$: ReplaySubject<Room<GameState>>;
  public observableState: GameStateAsObservables;

  /** @deprecated Room access object should not be used anymore as it is prone to inconsistencies */
  private room: Room<GameState>;

  private playerList: MapSchema<Player>;

  constructor(private colyseus: ColyseusClientService, private userService: UserService) {
    this.room$ = this.colyseus.activeRoom$;
    this.observableState = this.colyseus.getStateAsObservables();

    this.observableState.currentPlayerLogin$.subscribe((currentPlayerLogin: string) => {
      this.activePlayerLogin$.next(currentPlayerLogin);
    });
    this.observableState.action$.subscribe((action: string) => {
      this.activeAction$.next(action);
    });
    this.observableState.playerList$.subscribe((playerList: MapSchema<Player>) => {
      console.log('playerList update detected', playerList);
      this.playerList = playerList;
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
      this.currentHostLogin$.next(hostLoginName);
    });
    this.observableState.reversed$.subscribe((reversed: boolean) => {
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
        room.onStateChange.once(() => {
          console.info('[GameStateService] Initial GameState was provided. Synchronizing service access values.');
          this.isRoomDataAvailable$.next(true);
        });
      } else {
        console.info(`[GameStateService] Room changed to ${room}. This should only happen when a game is left.`);
        this.isRoomDataAvailable$.next(false);
      }
    });
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
        return this.me$.pipe(filter((p: Player) => p !== undefined)).pipe(map((me: Player) => hostLogin === me.loginName));
      })
    );
  }

  /**
   * @deprecated The room state should not be accessed directly anymore. Use either a wrapper function providing
   * a fitting Observable<T> in the GameStateService or access the ColyseusService.activeRoom$ Observable
   */
  getState(): GameState {
    if (this.room === undefined || this.room.state === undefined) {
      return undefined;
    } else {
      return this.room.state;
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

  /**
   * @deprecated
   */
  getMyLoginName(): string {
    return this.colyseus.myLoginName;
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getMyFigureId(): number {
    const p: Player = this.getByLoginName(this.getMyLoginName());
    return p.figureId;
  }

  findInPlayerList$(f: (p: Player) => boolean): Observable<Player | undefined> {
    return this.observableState.playerList$
      .pipe(take(1))
      .pipe(map((playerList: MapSchema<Player>) => Array.from(playerList.values()).find(f)));
  }

  getMe$(): Observable<Player> {
    return this.observableState.playerChange$.pipe(filter((p: Player) => p.loginName === this.getMyLoginName())).pipe(debounceTime(0));
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getMe(): Player {
    return this.getByLoginName(this.colyseus.myLoginName);
  }

  getCurrentPlayer$(): Observable<Player> {
    return this.observableState.playerList$.pipe(combineLatestWith(this.observableState.currentPlayerLogin$)).pipe(
      map((value: [MapSchema<Player>, string]) => {
        return value[0].get(value[1]);
      })
    );
  }

  getCurrentPlayerLogin$(): Observable<string> {
    return this.getCurrentPlayer$().pipe(map((player: Player) => player.loginName));
  }

  getCurrentPlayerDisplayName$(): Observable<string> {
    return this.getCurrentPlayer$().pipe(map((player: Player) => player.displayName));
  }

  /**
   * @deprecated This function accesses the room state directly. This is heavily discouraged.
   * Use either a wrapper function providing a fitting Observable<T> in the GameStateService
   * or access the ColyseusService.activeRoom$ Observable.
   */
  getByLoginName(loginName: string): Player {
    return this.playerList?.get(loginName);
  }

  getByLoginName$(loginName: string): Observable<Player | undefined> {
    return this.observableState.playerList$.pipe(take(1)).pipe(map((playerList: MapSchema<Player>) => playerList.get(loginName)));
  }

  getByDisplayName$(displayName: string): Observable<Player | undefined> {
    return this.findInPlayerList$((p: Player) => {
      return p.displayName === displayName;
    });
  }

  getDisplayName$(playerlogin: string): Observable<string | undefined> {
    return this.getByLoginName$(playerlogin).pipe(map((player: Player) => player?.displayName));
  }

  getLoginName$(playerDisplayName: string): Observable<string | undefined> {
    return this.getByDisplayName$(playerDisplayName).pipe(map((player: Player) => player?.loginName));
  }

  getPlayerArray$(): Observable<Player[]> {
    return this.observableState.playerList$.pipe(
      map((m: Map<string, Player>) => {
        return Array.from(m.values());
      })
    );
  }

  getBoardLayoutAsArray$(): Observable<Tile[]> {
    return this.observableState.boardLayout.tileList$.pipe(
      map((tileList: MapSchema<Tile>) => {
        const tiles: Tile[] = [];
        for (let i = 0; i < 64; i++) {
          tiles.push(tileList.get(String(i)));
        }
        return tiles;
      })
    );
  }

  sendMessage(type: number | string, data: unknown): void {
    this.roomOnce$().subscribe((r) => {
      r.send(type, data);
    });
  }

  registerMessageCallback(type: MessageType, cb: MessageCallback): number {
    return this.colyseus.registerMessageCallback(type, cb);
  }

  clearMessageCallback(id: number): boolean {
    return this.colyseus.clearMessageCallback(id);
  }
}
