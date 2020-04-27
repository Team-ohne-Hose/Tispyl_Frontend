import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';

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
export class TurnOverlayComponent implements AfterViewInit {

  turnChime: HTMLAudioElement = new Audio();
  state = 'faded';

  @Input()
  ownTurn = true;

  @Input()
  currentPlayerName = '';

  constructor() {
    this.turnChime.
  }

  ngAfterViewInit(): void {
  }

  triggerChime() {
    console.log('ownTurn:', this.ownTurn, 'state:', this.state);
    if (this.state === 'active') {
      console.log('INNER -> SEEMS ACTIVE');
      if ( this.ownTurn ) {
        console.log('BIMMEL OWN!°!',  this.turnChime);
        this.turnChime.src = '../../../assets/sounds/234564__foolboymedia__notification-up-i.wav';
      } else {
        console.log('others',  this.turnChime);
        this.turnChime.src = '../../../assets/sounds/414437__inspectorj__dropping-metal-pin-on-wood-a.wav';
      }
      this.turnChime.load();
      this.turnChime.play().then( e => {} );
    }
  }

  show() {
    this.state = 'active';
    setTimeout (() => {
      this.state = 'faded';
    }, 4000);
  }

}
