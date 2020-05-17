import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-ingame-rule-book',
  templateUrl: './ingame-rule-book.component.html',
  styleUrls: ['./ingame-rule-book.component.css']
})
export class IngameRuleBookComponent  {

  @Input()
  rules = [];
  hidden = true;

  toggleMove( ev ) {
    this.hidden = !this.hidden;
  }
}
