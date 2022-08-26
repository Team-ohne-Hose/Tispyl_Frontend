import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColyseusClientService } from '../../services/colyseus-client.service';
import { ViewportComponent } from './viewport/viewport.component';
import { GameAction, GameActionType, MessageType } from '../../model/WsData';
import { GameInitialisationService } from '../../services/game-initialisation.service';
import { InterfaceComponent } from './interface/interface.component';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import { CommandService } from '../../services/command.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { GameState } from '../../model/state/GameState';
import { Room } from 'colyseus.js';
import { Progress } from '../../services/object-loader/loaderTypes';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  animations: [trigger('fadeOutAnimation', [transition(':leave', [style({ opacity: '1' }), animate('0.5s', style({ opacity: '0' }))])])],
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewRef') viewRef: ViewportComponent;
  @ViewChild('interfaceRef') interfaceRef: InterfaceComponent;
  @ViewChild('loadingRef') loadingScreenRef: LoadingScreenComponent;

  isLoading = true;
  gameInitialization$$: Subscription;

  constructor(
    private router: Router,
    private colyseus: ColyseusClientService,
    private gameInit: GameInitialisationService,
    private commandService: CommandService,
    private cd: ChangeDetectorRef // probably temporary
  ) {
    commandService.registerGame(this);
  }

  ngAfterViewInit(): void {
    /** Redirect if the room is not available after 5000ms */
    const roomTimeoutId = setTimeout(() => {
      this.router.navigateByUrl('').then(() => {
        this.gameInitialization$$.unsubscribe();
        alert(`Der Raum dem du beitreten wolltest antwortet nicht oder existiert nicht.`);
      });
    }, 1000);

    /** Redirect if a user has no Room hes in, notify all players and start the initialization otherwise */
    this.gameInitialization$$ = this.colyseus.activeRoom$.subscribe(
      (currentRoom: Room<GameState>) => {
        if (currentRoom !== undefined) {
          clearTimeout(roomTimeoutId);
          this._forceOnChange(currentRoom); // <--- might be useless
          this.gameInit.init(this).subscribe(
            (p: Progress) => {
              console.debug('Loading:', p);
              this._handleProgress(p);
            },
            (err) => {
              console.error(err);
            },
            () => {
              this._endLoading();
            }
          );
        }
      },
      (err) => {
        console.error('Failed to retrieve the active room:', err);
        this.router.navigateByUrl('').then(() => {
          alert(`Irgendetwas ist mit dem Raum schief gegangen.\nFehler: ${err}`);
        });
      }
    );
  }

  /** Tasks de backend to propagate an OnChange() event to all players by calling 'triggerAll()' */
  private _forceOnChange(currentRoom: Room<GameState>): void {
    const msg: GameAction = {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.refreshData,
    };
    currentRoom.send(MessageType.GAME_MESSAGE, msg);
  }

  private _handleProgress(p: Progress) {
    if (p[0] === 0 && p[1] === 0) {
      this._startLoading();
    } else if (this.isLoading && p[0] <= p[1] && p[1] > 0) {
      this.loadingScreenRef.setProgress((p[0] / p[1]) * 100);
    }
  }

  private _startLoading(): void {
    if (this.loadingScreenRef !== undefined) {
      this.loadingScreenRef.isWaiting = false;
      this.loadingScreenRef.startTips();
      console.info('Started Loading process');
      console.time('Colyseus ready after');
      console.time('Finished Loading process');
      this.cd.detectChanges();
    } else {
      console.info('no loading screen');
    }
  }

  private _endLoading(): void {
    if (this.loadingScreenRef !== undefined) {
      this.loadingScreenRef.stopTips();
      this.isLoading = false;
      console.timeEnd('Finished Loading process');
      this.cd.detectChanges();
    } else {
      console.info('no loading screen');
    }
  }

  ngOnDestroy(): void {
    if (this.gameInitialization$$ !== undefined) {
      this.gameInitialization$$.unsubscribe();
    }
  }
}
