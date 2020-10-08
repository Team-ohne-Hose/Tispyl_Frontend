import {Component, Input} from '@angular/core';
import {GameActionType, MessageType} from '../../../model/WsData';
import {GameStateService} from '../../../services/game-state.service';
import {ColyseusNotifyable} from '../../../services/game-initialisation.service';

@Component({
  selector: 'app-next-turn-button',
  templateUrl: './next-turn-button.component.html',
  styleUrls: ['./next-turn-button.component.css']
})
export class NextTurnButtonComponent implements ColyseusNotifyable {
  @Input() disabled: boolean;
  @Input() action: string;

  hidden = true;
  private lastClick = 0;

  constructor(private gameState: GameStateService) { }

  attachColyseusStateCallbacks(): void {
    this.gameState.addNextTurnCallback(this.checkTurn.bind(this));
    const room = this.gameState.getRoom();
    if (room !== undefined) {
      this.checkTurn(room.state.currentPlayerLogin);
    }
  }
  attachColyseusMessageCallbacks(): void {}

  checkTurn(activePlayerLogin: string) {
    if (this.gameState.isMyTurn()) {
      // console.log('myTurn');
      this.hidden = false;
    } else {
      // console.log('nextTurn');
      this.hidden = true;
    }
  }

  nextTurn( event ) {
    console.log('clicked next turn');
    const room = this.gameState.getRoom();
    if (room !== undefined) {
      if (this.gameState.isMyTurn() && (new Date().getTime() - this.lastClick) > 500) {
        this.lastClick = new Date().getTime();
        if (room.state.action !== 'EXECUTE') {
          console.log('skipping actions..');
        }
        console.log('next Turn');
        this.gameState.sendMessage({type: MessageType.GAME_MESSAGE, action: GameActionType.advanceTurn});
      }
    }
  }

}
