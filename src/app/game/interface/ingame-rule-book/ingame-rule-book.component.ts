import {Component, Input, OnInit} from '@angular/core';
import {SpecialRule} from './SpecialRule';

@Component({
  selector: 'app-ingame-rule-book',
  templateUrl: './ingame-rule-book.component.html',
  styleUrls: ['./ingame-rule-book.component.css']
})
export class IngameRuleBookComponent  {

  @Input()
  rules: SpecialRule[] = [];

  addRuleByKey(event: KeyboardEvent, inputField: HTMLTextAreaElement) {
    if (event.code === 'Enter') {
      this.addRule(inputField);
    }
  }

  addRule(inputField: HTMLTextAreaElement) {
    const userInput: String = String(inputField.value).trim();
    inputField.value = '';
    if (userInput !== '') {
      this.rules.push(new SpecialRule('tiz', String(userInput)));
    }
  }

  removeRule(index: number) {
    this.rules.splice(index, 1);
  }
}
