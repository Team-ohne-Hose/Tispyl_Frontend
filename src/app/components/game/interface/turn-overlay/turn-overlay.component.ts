import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SoundService } from '../../../../services/sound.service';
import { GameStateService } from 'src/app/services/game-state.service';
import { Observable, Subscription, share, withLatestFrom } from 'rxjs';
import { Player } from 'src/app/model/state/Player';

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
export class TurnOverlayComponent implements OnInit, OnDestroy {
  state = 'faded';

  ownTurn: boolean;

  currentPlayerDisplayName$: Observable<string>;

  // subscriptions
  private currentPlayer$$: Subscription;
  private ownTurn$$: Subscription;

  constructor(private sounds: SoundService, protected gameStateService: GameStateService) {}

  ngOnInit(): void {
    /** withLatestFrom is used here because:
     * The resulting Observable has both values, but is only triggered when the
     * first Observable(currentPlayerLogin) gets a new value.
     * Therefore containing the currentPlayerLogin it was triggered with and the latest value of getMe$
     */
    this.currentPlayer$$ = this.gameStateService.observableState.currentPlayerLogin$
      .pipe(withLatestFrom(this.gameStateService.getMe$()))
      .subscribe((value: [string, Player]) => {
        this.triggerChime(value[0] === value[1].loginName);
      });
    this.ownTurn$$ = this.gameStateService.isMyTurn$().subscribe((ownTurn: boolean) => {
      this.ownTurn = ownTurn;
    });
    this.currentPlayerDisplayName$ = this.gameStateService.getCurrentPlayerDisplayName$().pipe(share());
  }

  ngOnDestroy(): void {
    this.currentPlayer$$.unsubscribe();
    this.ownTurn$$.unsubscribe();
  }

  triggerChime(ownTurn: boolean): void {
    ownTurn ? this.sounds.play(SoundService.OWN_TURN_SOUND) : this.sounds.play(SoundService.FOREIGN_TURN_SOUND);
  }

  show(): void {
    this.state = 'active';
    setTimeout(() => {
      this.state = 'faded';
    }, 4000);
  }
}
