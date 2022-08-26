import { Component, Input } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SoundService } from '../../../../services/sound.service';

@Component({
  selector: 'app-turn-overlay',
  templateUrl: './turn-overlay.component.html',
  styleUrls: ['./turn-overlay.component.css'],
  animations: [
    trigger('fading', [
      state(
        'active',
        style({
          opacity: 1,
          transform: 'rotateX(0deg)',
        })
      ),
      state(
        'faded',
        style({
          opacity: 0,
          transform: 'rotateX(90deg)',
        })
      ),
      transition('active => faded', animate('750ms ease-in-out')),
      transition('faded => active', animate('750ms ease-in-out')),
    ]),
  ],
})
export class TurnOverlayComponent {
  state = 'faded';

  @Input()
  ownTurn = true;

  @Input()
  currentPlayerName = '';

  constructor(private sounds: SoundService) {}

  triggerChime(): void {
    if (this.state === 'active') {
      this.ownTurn ? this.sounds.play(SoundService.OWN_TURN_SOUND) : this.sounds.play(SoundService.FOREIGN_TURN_SOUND);
    }
  }

  show(): void {
    this.state = 'active';
    setTimeout(() => {
      this.state = 'faded';
    }, 4000);
  }
}
