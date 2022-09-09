import { Injectable } from '@angular/core';
import { ColyseusClientService, MessageCallback } from './colyseus-client.service';
import { Room } from 'colyseus.js';
import { MapSchema } from '@colyseus/schema';
import { GameState } from '../model/state/GameState';
import { Player } from '../model/state/Player';
import { Tile } from '../model/state/BoardLayoutState';
import { MessageType } from '../model/WsData';
import { AsyncSubject, Observable, ReplaySubject, combineLatest } from 'rxjs';
import { combineLatestWith, filter, map, take } from 'rxjs/operators';
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
  me_async$: AsyncSubject<Player> = new AsyncSubject<Player>();
  public me$: Observable<Player>;

  room$: ReplaySubject<Room<GameState>>;
  public observableState: GameStateAsObservables;

  constructor(private colyseus: ColyseusClientService, private userService: UserService) {
    this.room$ = this.colyseus.activeRoom$;
    this.observableState = this.colyseus.getStateAsObservables();

    /*this.me$ = this.observableState.playerChange$
      .pipe(filter((p: Player) => p.loginName === this.getMyLoginName()))
      .pipe(debounceTime(0))
      .pipe(share());*/

    this.observableState.playerList$.subscribe((playerList: MapSchema<Player>) => {
      console.log('playerList update detected', playerList);
      if (!this.me_async$.isStopped) {
        this.me_async$.next(this._resolveMyPlayerObject(playerList));
        this.me_async$.complete();
      }
    });
    this.observableState.playerChange$.subscribe((player: Player) => {
      console.log('Player update detected', player);
    });

    /** Listen to Room changes ( entering / switching / leaving ) */
    colyseus.activeRoom$.subscribe((room: Room<GameState>) => {
      if (room !== undefined) {
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
    return combineLatest({
      me: this.getMe$(),
      hostLogin: this.observableState.hostLoginName$,
    }).pipe(
      map((value: { me: Player; hostLogin: string }) => {
        return value.hostLogin === value.me.loginName;
      })
    );
  }

  isMyTurn$(): Observable<boolean> {
    return combineLatest({
      currentPlayerLogin: this.observableState.currentPlayerLogin$,
      me: this.getMe$(),
    }).pipe(
      map((value: { currentPlayerLogin: string; me: Player }) => {
        return value.currentPlayerLogin === value.me.loginName;
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

  findInPlayerList$(f: (p: Player) => boolean): Observable<Player | undefined> {
    return this.observableState.playerList$
      .pipe(take(1))
      .pipe(map((playerList: MapSchema<Player>) => Array.from(playerList.values()).find(f)));
  }

  getMe$(): Observable<Player> {
    return this.observableState.playerList$
      .pipe(
        map((playerList: MapSchema<Player>) => {
          return playerList.get(this.getMyLoginName());
        })
      )
      .pipe(filter((player: Player) => player !== undefined));
    //return this.observableState.playerChange$.pipe(filter((p: Player) => p.loginName === this.getMyLoginName())).pipe(debounceTime(0));
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
    return this.getCurrentPlayer$()
      .pipe(filter((player: Player) => player !== undefined))
      .pipe(map((player: Player) => player.displayName));
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
