import {Component, ViewChild} from '@angular/core';
import {TurnOverlayComponent} from '../game/interface/turn-overlay/turn-overlay.component';
import {Player} from '../model/state/Player';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';

export class Option {
  name: string;
}
@Component({
  selector: 'app-debugdummy',
  templateUrl: './debugdummy.component.html',
  styleUrls: ['./debugdummy.component.css']
})
export class DebugdummyComponent {

  playerName;
  ownTurn = false;

  players: Player[] = [];
  playerDeselected: Map<string, boolean> = new Map<string, boolean>();

  options: Option[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('turnOverlay') turnOverlay: TurnOverlayComponent;

  constructor() {
    for (let i = 0; i < 14; i++) {
      const p = new Player();
      p.displayName = 'test' + i;
      p.loginName = 'test' + i;
      this.players.push(p);
    }
  }

  setName( name ) {
    console.log(name);
    this.playerName = name;
  }


  addOption(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.options.push({name: value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeOption(option: Option): void {
    const index = this.options.indexOf(option);

    if (index >= 0) {
      this.options.splice(index, 1);
    }
  }
  togglePlayer(p: Player) {
    console.log('toggleing');
    const selected = this.playerDeselected.get(p.loginName);
    if (selected) {
      this.playerDeselected.set(p.loginName, false);
    } else {
      this.playerDeselected.set(p.loginName, true);
    }
  }
  clearOptions() {
    this.options = [];
  }
  addPlayerOptions() {
    this.players.forEach((val: Player) => {
      if (!this.options.find((val2: Option) => {
        return val.displayName === val2.name;
      })) {
        this.options.push({name: val.displayName});
      }
    });
  }
}
