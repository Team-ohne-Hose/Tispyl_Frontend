import {Component, Input, OnInit} from '@angular/core';
import {key} from 'colyseus.js/lib/sync/helpers';

@Component({
  selector: 'app-state-display',
  templateUrl: './state-display.component.html',
  styleUrls: ['./state-display.component.css']
})
export class StateDisplayComponent implements OnInit {

  @Input() round: number;
  @Input() turn: string;
  @Input() action: string;
  @Input() rules: string[];

  knownActions = { ROLL: 'fas fa-dice', MOVE: 'fas fa-running', EXECUTE: 'fas fa-beer' };

  constructor() { }

  ngOnInit(): void {
  }
}
