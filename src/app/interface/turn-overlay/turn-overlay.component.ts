import {Component, Input} from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {SoundService} from '../../services/sound.service';

@Component({
  selector: 'app-turn-overlay',
  templateUrl: './turn-overlay.component.html',
  styleUrls: ['./turn-overlay.component.css'],
  animations: [
    trigger('fading', [
      state('active', style({
        opacity: 1,
        transform: 'rotateX(0deg)'

      })),
      state('faded', style({
        opacity: 0,
        transform: 'rotateX(90deg)'
      })),
      transition('active => faded', animate('750ms ease-in-out')),
      transition('faded => active', animate('750ms ease-in-out')),
    ])
  ]
})
export class TurnOverlayComponent {

  private state = 'faded';

  @Input()
  ownTurn = true;
  @Input()
  currentPlayerName = '';

  constructor( private sounds: SoundService) {}

  triggerChime() {
    if (this.state === 'active') {
      if ( this.ownTurn ) {
        this.sounds.play('own_turn');
      } else {
        this.sounds.play('others_turn');
      }
    }
  }

  show() {
    this.state = 'active';
    setTimeout (() => {
      this.state = 'faded';
    }, 4000);
  }
}
