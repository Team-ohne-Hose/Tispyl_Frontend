import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../../../services/game-state.service';
import { NextTurnButtonComponent } from './next-turn-button/next-turn-button.component';
import { TileOverlayComponent } from './tile-overlay/tile-overlay.component';
import { TurnOverlayComponent } from './turn-overlay/turn-overlay.component';
import { StateDisplayComponent } from './state-display/state-display.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShowAttribComponent } from '../show-attrib/show-attrib.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css'],
  animations: [
    trigger('fadeOutAnimation', [
      transition(':leave', [style({ opacity: '1' }), animate('0.25s ease-in', style({ opacity: '0' }))]),
    ]),
  ],
})
export class InterfaceComponent {
  routes;
  @ViewChild('nextTurn') nextTurnRef: NextTurnButtonComponent;
  @ViewChild('tileOverlay') tileOverlayRef: TileOverlayComponent;
  @ViewChild('turnOverlay') turnOverlayRef: TurnOverlayComponent;
  @ViewChild('stateDisplay') stateDisplayRef: StateDisplayComponent;

  isMyTurn$: Observable<boolean>;

  constructor(private router: Router, public gameState: GameStateService, private dialog: MatDialog) {
    this.routes = router.config.filter((route) => route.path !== '**' && route.path.length > 0);
    this.isMyTurn$ = this.gameState.isMyTurn$();
    this.gameState.activePlayerLogin$.subscribe((_) => {
      if (this.turnOverlayRef !== undefined) {
        this.turnOverlayRef.show();
      }
    });
  }

  showAttribution(): void {
    const dialogRef: MatDialogRef<
      ShowAttribComponent,
      { roomName: string; skinName: string; randomizeTiles: boolean }
    > = this.dialog.open(ShowAttribComponent, {
      width: '80%',
      maxWidth: '900px',
      height: '70%',
      maxHeight: '750px',
      data: {},
      panelClass: 'modalbox-base',
    });
  }
}
