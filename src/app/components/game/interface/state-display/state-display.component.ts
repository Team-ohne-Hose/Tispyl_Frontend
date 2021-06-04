import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-state-display',
  templateUrl: './state-display.component.html',
  styleUrls: ['./state-display.component.css'],
})
export class StateDisplayComponent {
  @Input() round: number;
  @Input() currentPlayerDisplayName: string;
  @Input() action: string;
  @Input() rules: string[];

  knownActions = { ROLL: 'fas fa-dice', MOVE: 'fas fa-running', EXECUTE: 'fas fa-beer' };
}
