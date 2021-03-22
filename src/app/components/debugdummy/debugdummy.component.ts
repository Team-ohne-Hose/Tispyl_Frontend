import {Component, ViewChild} from '@angular/core';
import {TurnOverlayComponent} from '../game/interface/turn-overlay/turn-overlay.component';
import {Player} from '../../model/state/Player';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import {MatChipInputEvent} from '@angular/material/chips';
import {VoteSystemState} from '../game/interface/menu-bar/vote-system/helpers/VoteSystemState';

@Component({
  selector: 'app-debugdummy',
  templateUrl: './debugdummy.component.html',
  styleUrls: ['./debugdummy.component.css']
})
export class DebugdummyComponent {

  playerName;
  ownTurn = false;

  state = VoteSystemState.default;

  constructor() {}

  setDefault() {
    this.state = VoteSystemState.default;
  }
  setWaiting() {
    this.state = VoteSystemState.waiting;
  }
  setResults() {
    this.state = VoteSystemState.results;
  }
  setNotE() {
    this.state = VoteSystemState.notEligible;
  }
  setCreating() {
    this.state = VoteSystemState.creating;
  }
  setVoting() {
    this.state = VoteSystemState.voting;
  }




  addOption(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeOption(option: any): void {

  }
  togglePlayer(p: Player) {

  }
  clearOptions() {
  }
  addPlayerOptions() {

  }
}
