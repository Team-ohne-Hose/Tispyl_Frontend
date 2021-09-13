import { Component, Input } from '@angular/core';
import { GameActionType, MessageType } from '../../../../../model/WsData';
import { GameStateService } from '../../../../../services/game-state.service';
import { Rule } from '../../../../../model/state/Rule';

interface StaticRule {
  text: string;
  icon: string;
}

@Component({
  selector: 'app-ingame-rule-book',
  templateUrl: './ingame-rule-book.component.html',
  styleUrls: ['./ingame-rule-book.component.css'],
})
export class IngameRuleBookComponent {
  @Input() rules: Rule[] = [];

  staticRules: StaticRule[] = [
    {
      text: 'Kommst du auf ein Feld musst du die Aufgabe auf diesem ausführen.',
      icon: 'fas fa-running',
    },
    { text: 'Ein 0,33L sollte in ca. acht Schlücken leer sein.', icon: 'fas fa-ruler-combined' },
    {
      text: 'Kritik am Spiel wird mit 2 Strafschlücken geahndet.',
      icon: 'fas fa-microphone-alt-slash',
    },
    { text: 'Jede Aktion muss versucht werden.', icon: 'far fa-dizzy' },
    { text: 'Fehlgeschlagene Aufgaben werden mit 2 Strafschlücken bestraft.', icon: 'fas fa-beer' },
    { text: 'Wer mit spielt akzeptiert automatisch alle Regeln.', icon: 'fas fa-balance-scale' },
  ];

  constructor(private gameState: GameStateService) {}

  addRuleByKey(event: KeyboardEvent, inputField: HTMLTextAreaElement) {
    if (event.code === 'Enter') {
      this.addRule(inputField);
    }
  }

  addRule(inputField: HTMLTextAreaElement): void {
    console.log('current Rules', this.rules);
    const userInput: string = String(inputField.value).trim();
    inputField.value = '';
    if (userInput !== '') {
      console.log(userInput);
      this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.addRule,
        text: String(userInput),
        author: this.gameState.getMe().displayName,
      });
    }
  }

  removeRule(index: number) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.deleteRule,
      id: index,
    });
  }
}
