import { Component, Input } from '@angular/core';
import { GameActionType, MessageType } from '../../../../model/WsData';
import { Player } from '../../../../model/state/Player';
import { GameStateService } from '../../../../services/game-state.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
export class PregameBannerComponent {
  @Input()
  players: Player[];

  amIReady = false;

  constructor(private gameState: GameStateService) {}

  readyEvent(): void {
    this.amIReady = !this.amIReady;
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.readyPropertyChange,
      isReady: this.amIReady,
    });
  }

  countReadyPlayers(): number {
    return this.players.filter((p) => p.isReady).length;
  }
}
