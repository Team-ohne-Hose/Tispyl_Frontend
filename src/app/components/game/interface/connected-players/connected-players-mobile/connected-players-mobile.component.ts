import { Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlayerIconComponent } from 'src/app/components/framework/player-icon/player-icon.component';
import { Player } from 'src/app/model/state/Player';
import { GameStateService } from 'src/app/services/game-state.service';
import { ConnectedPlayersComponentView } from '../connected-players.component';

@Component({
  selector: 'app-connected-players-mobile',
  templateUrl: './connected-players-mobile.component.html',
  styleUrls: ['./connected-players-mobile.component.css', '../connected-players.shared.css'],
  animations: [
    trigger('turnMovement', [
      state('yours', style({ transform: 'translateY(.1rem)' })),
      state('others', style({ transform: 'translateY(0rem)' })),
      transition('yours <=> others', [animate('0.25s ease-out')]),
    ]),
  ],
})
export class ConnectedPlayersMobileComponent implements ConnectedPlayersComponentView {
  @Input() playerIsDev$: BehaviorSubject<Map<string, boolean>>;
  @Input() neighbours$: Observable<[number, number]>;
  @Input() players$: Observable<Player[]>;

  @ViewChildren('playersRef')
  playersRef: QueryList<PlayerIconComponent>;

  @ViewChildren('playerBoxes')
  playerBoxes: QueryList<ElementRef<HTMLDivElement>>;

  currentPlayerBox: ElementRef<HTMLDivElement>;

  constructor(protected gameState: GameStateService) {}

  refreshPlayerIcons() {
    this.playersRef.map((icon) => icon.refresh());
  }

  scrollPlayerListBack(e: TouchEvent) {
    // use time to snap back to the current Player
    this.scrollPlayerBoxIntoView(100);
  }

  onNextPlayer(playerLogin: string) {
    this.scrollPlayerBoxIntoView(1, playerLogin);
  }

  onPlayerListChange(playerLogin: string) {
    this.scrollPlayerBoxIntoView(1, playerLogin);
  }

  private refreshCurrentPlayerBox(playerLogin: string) {
    this.currentPlayerBox = this.playerBoxes.find((item) => {
      return item.nativeElement.getAttribute('isGhost') === 'false' && item.nativeElement.getAttribute('loginName') === playerLogin;
    });
  }

  /** Scrolls the correct PlayerBox into the center of the screen
   * Will be added at the end of the eventloop to make sure html is updated
   * and the Playerboxes all have the correct sizes.
   *
   * @param timeout the timeout after which will be scrolled.
   * @param playerLogin the login of the player to scroll to the center.
   * When supplied, the correct Playerbox will be searched and updated,
   * otherwise the old cached reference will be used.
   */
  private scrollPlayerBoxIntoView(timeout: number, playerLogin?: string) {
    window.setTimeout(() => {
      if (playerLogin) {
        this.refreshCurrentPlayerBox(playerLogin);
      }
      this.currentPlayerBox?.nativeElement?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }, timeout);
  }
}
