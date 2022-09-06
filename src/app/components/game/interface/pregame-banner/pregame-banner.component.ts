import { Component, Input, OnInit } from '@angular/core';
import { GameActionType, MessageType } from '../../../../model/WsData';
import { Player } from '../../../../model/state/Player';
import { GameStateService } from '../../../../services/game-state.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MapSchema } from '@colyseus/schema';
import { Observable, Subject, map, share } from 'rxjs';

@Component({
  selector: 'app-pregame-banner',
  templateUrl: './pregame-banner.component.html',
  styleUrls: ['./pregame-banner.component.css'],
  animations: [
    trigger('joinLeave', [
      transition(':enter', [
        style({ transform: 'translate(-15%)', opacity: '0' }),
        animate('0.25s ease-out', style({ transform: 'translate(0)', opacity: '1' })),
      ]),
      transition(':leave', [
        style({ transform: 'translate(0)', opacity: '1' }),
        animate('0.25s ease-in', style({ transform: 'translate(15%)', opacity: '0' })),
      ]),
    ]),
    trigger('readyNotReadyBorder', [
      state('ready', style({ border: 'rgba(0, 255, 21, 0.3) solid 2px' })),
      state('notReady', style({ border: 'rgba(255, 0, 27, 0.3) solid 2px' })),
      transition('notReady => ready', [animate('0.25s')]),
      transition('ready => notReady', [animate('0.25s')]),
    ]),
  ],
})
export class PregameBannerComponent implements OnInit {
  @Input()
  players$: Subject<MapSchema<Player>>;

  amIReady = false;

  protected readyPlayers$: Observable<number>;
  protected totalPlayers$: Observable<number>;

  constructor(private gameState: GameStateService) {}

  ngOnInit(): void {
    this.players$.subscribe((playerList: MapSchema<Player>) => {
      console.log('new PlayerList1', playerList);
      for (const p of playerList) {
        console.log('player', p);
      }
    });
    this.players$.subscribe((playerList: MapSchema<Player>) => {
      console.log('new PlayerList2', playerList);
    });
    this.readyPlayers$ = this.players$
      .pipe<number>(
        map((playerList: MapSchema<Player>) => {
          let len = 0;
          console.log('readyplayers', playerList);
          playerList.forEach((player: Player) => {
            console.log('readyplayers', player);
            if (player.isReady) {
              len++;
            }
          });
          return len;
          /*
            const len = Array.from(playerList.values()).filter((player: Player) => {
              return player.isReady;
            }).length;
            console.log("ready", len, playerList);
            return len;*/
        })
      )
      .pipe(share());
    this.totalPlayers$ = this.players$
      .pipe(
        map((playerList: MapSchema<Player>) => {
          return Array.from(playerList.values()).length;
        })
      )
      .pipe(share());

    this.readyPlayers$.subscribe((value: number) => {
      console.log('ready Players:', value);
    });
    this.totalPlayers$.subscribe((value: number) => {
      console.log('total Players:', value);
    });
  }

  readyEvent(): void {
    this.amIReady = !this.amIReady;
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.readyPropertyChange,
      isReady: this.amIReady,
    });
  }
}
