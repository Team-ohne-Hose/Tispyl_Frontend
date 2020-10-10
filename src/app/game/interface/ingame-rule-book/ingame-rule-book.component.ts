import {Component, Input, OnInit} from '@angular/core';
import {SpecialRule} from './SpecialRule';
import {GameActionType, MessageType} from '../../../model/WsData';
import {GameStateService} from '../../../services/game-state.service';

@Component({
  selector: 'app-ingame-rule-book',
  templateUrl: './ingame-rule-book.component.html',
  styleUrls: ['./ingame-rule-book.component.css']
})
export class IngameRuleBookComponent  {

  @Input() rules = [];
  //rules: SpecialRule[] = [];

  constructor(private gameState: GameStateService) {
  }

  addRuleByKey(event: KeyboardEvent, inputField: HTMLTextAreaElement) {
    if (event.code === 'Enter') {
      this.addRule(inputField);
    }
  }

  addRule(inputField: HTMLTextAreaElement) {
    console.log('current Rules', this.rules);
    const userInput: String = String(inputField.value).trim();
    inputField.value = '';
    if (userInput !== '') {
      console.log(userInput);
      this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.addRule,
        text: String(userInput),
        author: ''});
    }



  }

  removeRule(index: number) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.deleteRule,
      id: index});
  }
}
