import { Component, OnDestroy, OnInit } from '@angular/core';
import { Player } from '../../../../model/state/Player';
import { GameStateService } from '../../../../services/game-state.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { BasicUser, UserService } from '../../../../services/user.service';
import { APIResponse } from '../../../../model/APIResponse';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connected-players',
  templateUrl: './connected-players.component.html',
  styleUrls: ['./connected-players.component.css'],
  animations: [
    trigger('turnMovement', [
      state('yours', style({ transform: 'translate(0rem)' })),
      state('others', style({ transform: 'translate(-1rem)' })),
      transition('yours <=> others', [animate('0.25s ease-out')]),
    ]),
  ],
})
export class ConnectedPlayersComponent implements OnInit, OnDestroy {
  /** Visibility state */
  players$: Observable<Player[]>;
  myLogin$: Observable<string>;
  activePlayerLogin$: Observable<string>;
  isTurnOrderReversed$: Observable<boolean>;

  /** Visibility state - flags */
  // TODO: This is to be extended to retrieve roles instead of just the is_dev flag
  playerIsDev$$: Subscription;
  playerIsDev$: BehaviorSubject<Map<string, boolean>> = new BehaviorSubject<Map<string, boolean>>(new Map());
  neighbours$: Observable<[number, number]>;

  constructor(private gameState: GameStateService, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    /** GameState bindings */
    this.isTurnOrderReversed$ = this.gameState.isTurnOrderReversed$;
    this.activePlayerLogin$ = this.gameState.activePlayerLogin$;
    this.myLogin$ = this.getLoginName();
    this.players$ = this.getActivePlayers();
    this.neighbours$ = this.getNeighbours();
    this.bindIsDevSubject();
  }

  ngOnDestroy(): void {
    /** Clean Bindings */
    if (this.playerIsDev$$ !== undefined) {
      this.playerIsDev$$.unsubscribe();
      this.playerIsDev$.complete();
    }
  }

  leaveGame(): void {
    const _ = this.router.navigateByUrl('/lobby');
  }

  private getLoginName(): Observable<string> {
    return this.gameState.me$.pipe(
      map((p: Player) => {
        return p.loginName;
      })
    );
  }

  private getActivePlayers(): Observable<Player[]> {
    return this.gameState.getPlayerArray$().pipe(
      map((pList: Player[]) => {
        return pList.filter((p: Player) => {
          return !p.hasLeft;
        });
      })
    );
  }

  private getNeighbours(): Observable<[number, number]> {
    return this.getActivePlayers().pipe(
      mergeMap((pList: Player[]) => {
        return this.myLogin$.pipe(
          map((myLogin: string) => {
            const myIdx: number = pList.findIndex((p) => p.loginName === myLogin);
            return this._safeNeighbourIndices(myIdx, pList.length);
          })
        );
      })
    );
  }

  private _safeNeighbourIndices(idx: number, listLength: number): [number, number] {
    if (idx < 0 || idx >= listLength || listLength < 2) {
      // index not in list or list to small to have neighbors
      return [-1, -1];
    }
    if (idx === 0) {
      // you are first in list, your left neighbor is at the end of list
      return [listLength - 1, idx + 1];
    } else if (idx === listLength - 1) {
      // you are last in list, your right neighbor is at the start of list
      return [idx - 1, 0];
    } else {
      // normal case
      return [idx - 1, idx + 1];
    }
  }

  private bindIsDevSubject(): void {
    this.playerIsDev$$ = this.gameState
      .getPlayerArray$()
      .pipe(map(this._filterUnresolved.bind(this)), mergeMap(this._resolveLogins.bind(this)), map(this._buildResultMap.bind(this)))
      .subscribe((suc: Map<string, boolean>) => {
        this.playerIsDev$.next(suc);
      });
  }

  private _filterUnresolved(pList: Player[]): string[] {
    return pList
      .filter((p: Player) => {
        return !this.playerIsDev$.value.has(p.loginName);
      })
      .map((p: Player) => {
        return p.loginName;
      });
  }

  private _resolveLogins(logins: string[]): Observable<[string, boolean][]> {
    const logins$: Observable<[string, boolean]>[] = logins.map((l: string) => {
      return this.userService.getUserByLoginName(l).pipe(map((res: APIResponse<BasicUser>) => [l, res.payload.is_dev]));
    });
    return forkJoin(logins$);
  }

  private _buildResultMap(mapping: [string, boolean][]): Map<string, boolean> {
    const resultMap = new Map(this.playerIsDev$.value.entries());
    mapping.forEach((pair: [string, boolean]) => {
      resultMap.set(pair[0], pair[1]);
    });
    return resultMap;
  }
}
