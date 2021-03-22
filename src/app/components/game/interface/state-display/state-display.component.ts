import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-state-display',
  templateUrl: './state-display.component.html',
  styleUrls: ['./state-display.component.css']
})
export class StateDisplayComponent implements OnInit {

  @Input() round: number;
  @Input() currentPlayerDisplayName: string;
  @Input() action: string;
  @Input() rules: string[];

  knownActions = {ROLL: 'fas fa-dice', MOVE: 'fas fa-running', EXECUTE: 'fas fa-beer'};

  constructor() {
  }

  ngOnInit(): void {
  }
}
