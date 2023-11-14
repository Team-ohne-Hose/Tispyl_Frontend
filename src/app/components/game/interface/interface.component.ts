import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../../../services/game-state.service';
import { TileOverlayComponent } from './tile-overlay/tile-overlay.component';
import { TurnOverlayComponent } from './turn-overlay/turn-overlay.component';
import { StateDisplayComponent } from './state-display/state-display.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ShowAttribComponent } from '../show-attrib/show-attrib.component';
import { Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css'],
  animations: [
    trigger('fadeOutAnimation', [transition(':leave', [style({ opacity: '1' }), animate('0.25s ease-in', style({ opacity: '0' }))])]),
  ],
})
export class InterfaceComponent implements OnInit, OnDestroy {
  routes;
  @ViewChild('tileOverlay') tileOverlayRef: TileOverlayComponent;
  @ViewChild('turnOverlay') turnOverlayRef: TurnOverlayComponent;
  @ViewChild('stateDisplay') stateDisplayRef: StateDisplayComponent;

  // make Breakpoints visible in .html file
  Breakpoints = Breakpoints;
  readonly breakpoint$ = this.breakpointObserver.observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, Breakpoints.Web]);
  public currentBreakpoint;

  // subscriptions
  private currentPlayerLogin$$: Subscription;
  private breakpoint$$: Subscription;

  constructor(
    private router: Router,
    public gameState: GameStateService,
    private dialog: MatDialog,
    public breakpointObserver: BreakpointObserver
  ) {
    this.routes = router.config.filter((route) => route.path !== '**' && route.path.length > 0);
  }

  private setBreakpoints() {
    if (this.breakpointObserver.isMatched(Breakpoints.HandsetPortrait)) {
      console.log('Breakpoint Mobile Portrait');
      this.currentBreakpoint = Breakpoints.HandsetPortrait;
    } else if (this.breakpointObserver.isMatched(Breakpoints.HandsetLandscape)) {
      console.log('Breakpoint Mobile Landscape');
      this.currentBreakpoint = Breakpoints.HandsetLandscape;
    } else if (this.breakpointObserver.isMatched(Breakpoints.Web)) {
      console.log('Breakpoint Web');
      this.currentBreakpoint = Breakpoints.Web;
    }
  }

  ngOnInit(): void {
    this.breakpoint$$ = this.breakpoint$.subscribe((value) => {
      this.setBreakpoints();
    });
    this.setBreakpoints();

    this.currentPlayerLogin$$ = this.gameState.observableState.currentPlayerLogin$.subscribe(() => {
      if (this.turnOverlayRef !== undefined) this.turnOverlayRef.show();
    });
  }

  ngOnDestroy(): void {
    this.currentPlayerLogin$$.unsubscribe();
  }

  showAttribution(): void {
    this.dialog.open(ShowAttribComponent, {
      width: '80%',
      maxWidth: '900px',
      height: '70%',
      maxHeight: '750px',
      data: {},
      panelClass: 'modalbox-base',
    });
  }
}
