import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { GameStateService } from 'src/app/services/game-state.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Player } from 'src/app/model/state/Player';
import { PlayerIconComponent } from 'src/app/components/framework/player-icon/player-icon.component';
import { ConnectedPlayersComponentView } from '../connected-players.component';

@Component({
  selector: 'app-connected-players-web',
  templateUrl: './connected-players-web.component.html',
  styleUrls: ['./connected-players-web.component.css', '../connected-players.shared.css'],
  animations: [
    trigger('turnMovement', [
      state('yours', style({ transform: 'translateX(0rem)' })),
      state('others', style({ transform: 'translateX(-1rem)' })),
      transition('yours <=> others', [animate('0.25s ease-out')]),
    ]),
  ],
})
export class ConnectedPlayersWebComponent implements ConnectedPlayersComponentView {
  @Input() playerIsDev$: BehaviorSubject<Map<string, boolean>>;
  @Input() neighbours$: Observable<[number, number]>;
  @Input() players$: Observable<Player[]>;
  @Input() leaveGame: () => void;

  @ViewChildren('playersRef')
  playersRef: QueryList<PlayerIconComponent>;

  constructor(protected gameState: GameStateService) {}

  refreshPlayerIcons() {
    this.playersRef.map((icon) => icon.refresh());
  }
}
