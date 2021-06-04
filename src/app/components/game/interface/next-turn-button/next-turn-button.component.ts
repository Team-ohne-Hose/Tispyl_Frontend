import { Component, Input } from '@angular/core';
import { GameActionType, MessageType } from '../../../../model/WsData';
import { GameStateService } from '../../../../services/game-state.service';
import { ColyseusNotifyable } from '../../../../services/game-initialisation.service';

@Component({
  selector: 'app-next-turn-button',
  templateUrl: './next-turn-button.component.html',
  styleUrls: ['./next-turn-button.component.css'],
})
export class NextTurnButtonComponent implements ColyseusNotifyable {
  @Input() disabled: boolean;
  @Input() action: string;

  hidden = true;
  private lastClick = 0;

  constructor(private gameState: GameStateService) {}

  attachColyseusStateCallbacks(gameState: GameStateService): void {
    gameState.addNextTurnCallback(this.checkTurn.bind(this));
    this.checkTurn(this.gameState.getCurrentPlayerLogin());
  }

  attachColyseusMessageCallbacks(gameState: GameStateService): void {
    return;
  }

  checkTurn(activePlayerLogin: string): void {
    if (this.gameState.isMyTurn()) {
      // console.log('myTurn');
      this.hidden = false;
    } else {
      // console.log('nextTurn');
      this.hidden = true;
    }
  }

  nextTurn(event: Event): void {
    console.log('clicked next turn');
    if (this.gameState.isMyTurn() && new Date().getTime() - this.lastClick > 500) {
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
  }
}
