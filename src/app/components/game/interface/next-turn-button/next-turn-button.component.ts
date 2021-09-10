import { Component, Input } from '@angular/core';
import { GameActionType, MessageType } from '../../../../model/WsData';
import { GameStateService } from '../../../../services/game-state.service';
import { ColyseusNotifiable } from '../../../../services/game-initialisation.service';

@Component({
  selector: 'app-next-turn-button',
  templateUrl: './next-turn-button.component.html',
  styleUrls: ['./next-turn-button.component.css'],
})
export class NextTurnButtonComponent {
  @Input() disabled: boolean;
  @Input() action: string;

  hidden = true;
  private lastClick = 0;

  constructor(private gameState: GameStateService) {}

  checkTurn(activePlayerLogin: string): void {
    this.gameState.isMyTurnOnce$().subscribe((myTurn: boolean) => {
      this.hidden = !myTurn;
    });
  }

  nextTurn(event: Event): void {
    console.log('clicked next turn');
    this.gameState.isMyTurnOnce$().subscribe((myTurn: boolean) => {
      if (myTurn && new Date().getTime() - this.lastClick > 500) {
        this.lastClick = new Date().getTime();
        if (this.gameState.getAction() !== 'EXECUTE') {
          console.log('skipping actions..');
        }
        console.log('next Turn');
        this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
          type: MessageType.GAME_MESSAGE,
          action: GameActionType.advanceTurn,
        });
      }
    });
  }
}
