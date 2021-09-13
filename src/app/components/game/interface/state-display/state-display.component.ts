import { Component, Input, OnDestroy } from '@angular/core';
import { GameStateService } from '../../../../services/game-state.service';
import { GameActionType, MessageType, WsData } from '../../../../model/WsData';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Timer } from '../../../framework/Timer';
import { SoundService } from '../../../../services/sound.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Player } from '../../../../model/state/Player';

@Component({
  selector: 'app-state-display',
  templateUrl: './state-display.component.html',
  styleUrls: ['./state-display.component.css'],
  animations: [
    trigger('buttonMovement', [
      state('embedded', style({ top: '-1px' })),
      state('hovering', style({ top: '5rem', transform: 'scale(1.5) rotate(360deg)' })),
      transition(':enter', [
        style({ transform: 'translate(0, -6rem)' }),
        animate('0.5s cubic-bezier(.63, -0.34, .36, 1.22)', style({ transform: 'translate(0, 0)' })),
      ]),
      transition(':leave', [
        style({ transform: 'translate(0, 0)' }),
        animate('0.5s cubic-bezier(.63, -0.34, .36, 1.22)', style({ transform: 'translate(0, -6rem)' })),
      ]),
      transition('embedded <=> hovering', [animate('0.5s cubic-bezier(.63, -0.34, .36, 1.22)')]),
    ]),
  ],
})
export class StateDisplayComponent implements OnDestroy {
  /** External values */
  @Input() round: number;
  @Input() currentPlayerDisplayName: string;
  @Input() action: string;
  @Input() rules: string[];
  @Input() disabled: boolean;

  /** Action mappings */
  actionIcons = { ROLL: 'fas fa-dice', MOVE: 'fas fa-running', EXECUTE: 'fas fa-beer' };
  actionTexts = { ROLL: 'Würfeln', MOVE: 'Laufen', EXECUTE: 'Ausführen' };

  /** State values */
  lastClick = 0;
  isMyTurn$: Observable<boolean>;
  lastTimePlayed = Date.now();
  turnDelayTimer: Timer;
  clickDelayTimer: Timer;
  activeTimer: Timer;
  currentCD = '0%';
  canWake = true;

  /** Configurable values */
  private readonly TIMER_UPDATE_FREQ = 25;
  private readonly CD_PLAYER_TURN_CHANGED = 30000;
  private readonly CD_PLAYER_CLICKED = 5000;
  private readonly CD_SOUND_PLAYED = 5000;
  private readonly NEXT_TURN_CLICK_DELAY = 500;

  /** Internals */
  private readonly callbackId: number = undefined;

  constructor(private gameState: GameStateService, private sounds: SoundService) {
    this.turnDelayTimer = new Timer(this.CD_PLAYER_TURN_CHANGED, this.TIMER_UPDATE_FREQ, {
      onProgress: () => {
        this.currentCD = this.turnDelayTimer.getCurrentPercentile() + '%';
      },
      onReset: () => {
        this.currentCD = '0%';
      },
      onFinished: () => {
        this.canWake = true;
      },
    });
    this.clickDelayTimer = new Timer(this.CD_PLAYER_CLICKED, this.TIMER_UPDATE_FREQ, {
      onProgress: () => {
        this.currentCD = this.clickDelayTimer.getCurrentPercentile() + '%';
      },
      onReset: () => {
        this.currentCD = '0%';
      },
      onFinished: () => {
        this.canWake = true;
      },
    });
    this.isMyTurn$ = this.gameState.isMyTurn$();
    this.isMyTurn$.subscribe(this.checkTurn.bind(this));

    this.callbackId = gameState.registerMessageCallback(MessageType.GAME_MESSAGE, {
      filterSubType: GameActionType.wakePlayer,
      f: (data: WsData) => {
        if (data.type === MessageType.GAME_MESSAGE) {
          switch (data.action) {
            case GameActionType.wakePlayer:
              this.gameState.me$.pipe(take(1)).subscribe((me: Player) => {
                if (data.targetLoginName === me.loginName) {
                  this.playWakeChime();
                }
              });
              break;
            default:
              break;
          }
        }
      },
    });
  }

  checkTurn(isMyTurn: boolean): void {
    if (!isMyTurn) {
      if (this.activeTimer !== undefined) {
        this.activeTimer.reset();
      }
      this.activeTimer = this.turnDelayTimer;
      this.activeTimer.start();
      this.canWake = false;
    }
  }

  nextTurn(): void {
    this.gameState.isMyTurnOnce$().subscribe((myTurn: boolean) => {
      if (myTurn && Date.now() - this.lastClick > this.NEXT_TURN_CLICK_DELAY) {
        this.lastClick = Date.now();
        console.log('Next turn was triggered');
        this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
          type: MessageType.GAME_MESSAGE,
          action: GameActionType.advanceTurn,
        });
      }
    });
  }

  playWakeChime(): void {
    if (Date.now() - this.lastTimePlayed > this.CD_SOUND_PLAYED) {
      this.lastTimePlayed = Date.now();
      console.info('Hey wake up!');
      this.sounds.play(SoundService.WAKE_PLAYER);
    }
  }

  alertPlayer(): void {
    if (this.activeTimer !== undefined) {
      this.activeTimer.reset();
    }
    this.activeTimer = this.clickDelayTimer;
    this.canWake = false;
    this.activeTimer.start();

    this.gameState.activePlayerLogin$.pipe(take(1)).subscribe((name: string) => {
      if (name !== undefined && name !== '' && name !== null) {
        this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
          type: MessageType.GAME_MESSAGE,
          action: GameActionType.wakePlayer,
          targetLoginName: name,
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.gameState.clearMessageCallback(this.callbackId);
  }
}
