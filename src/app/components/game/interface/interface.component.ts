import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GameComponent } from '../game.component';
import { GameStateService } from '../../../services/game-state.service';
import { NextTurnButtonComponent } from './next-turn-button/next-turn-button.component';
import { TileOverlayComponent } from './tile-overlay/tile-overlay.component';
import { ColyseusNotifyable } from '../../../services/game-initialisation.service';
import { TurnOverlayComponent } from './turn-overlay/turn-overlay.component';
import { ConnectedPlayersComponent } from './connected-players/connected-players.component';

@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css'],
})
export class InterfaceComponent implements ColyseusNotifyable {
  routes;
  gameComponent: GameComponent;
  @ViewChild('nextTurn') nextTurnRef: NextTurnButtonComponent;
  @ViewChild('tileOverlay') tileOverlayRef: TileOverlayComponent;
  @ViewChild('turnOverlay') turnOverlayRef: TurnOverlayComponent;
  @ViewChild('connectedPlayers') connectedPlayersRef: ConnectedPlayersComponent;

  constructor(private router: Router, public gameState: GameStateService) {
    this.routes = router.config.filter((route) => route.path !== '**' && route.path.length > 0);
  }

  attachColyseusStateCallbacks(gameState: GameStateService): void {
    gameState.addNextTurnCallback((activePlayerLogin: string) => {
      this.turnOverlayRef.show();
    });
  }

  attachColyseusMessageCallbacks(gameState: GameStateService): void {
    return;
  }
}
