import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { GameActionType, GameShowTile, MessageType } from '../../../../model/WsData';
import { BoardTilesService } from '../../../../services/board-tiles.service';
import { GameStateService } from '../../../../services/game-state.service';
import { FileService } from '../../../../services/file.service';
import { Timer } from '../../../framework/Timer';
import { animate, group, sequence, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tile-overlay',
  templateUrl: './tile-overlay.component.html',
  styleUrls: ['./tile-overlay.component.css'],
  animations: [
    trigger('largeContentAnimation', [
      transition('void => *', [
        sequence([style({ opacity: '0', height: '0rem' }), animate('0.5s ease-out', style({ opacity: '1', height: '31.25rem' }))]),
      ]),
      transition('* => void', [
        sequence([
          style({ opacity: '1', position: 'absolute', height: '31.25rem' }),
          group([animate('0.25s ease-out', style({ opacity: '0' })), animate('0.5s ease-out', style({ height: '0rem' }))]),
        ]),
      ]),
    ]),
    trigger('smallContentAnimation', [
      transition('void => *', [
        sequence([style({ opacity: '0', height: '31.25rem' }), animate('0.5s ease-out', style({ opacity: '1', height: '5rem' }))]),
      ]),
      transition('* => void', [
        sequence([
          style({ opacity: '1', position: 'absolute', top: '0', left: '0' }),
          animate('0.5s ease-out', style({ opacity: '0', position: 'absolute', top: '0', left: '0' })),
        ]),
      ]),
    ]),
  ],
})
export class TileOverlayComponent implements OnDestroy {
  /** Child references */
  @ViewChild('options') optionsRef: ElementRef<HTMLDivElement>;
  @ViewChild('optionsCog') optionsCogRef: ElementRef<HTMLDivElement>;
  @ViewChild('info') infoRef: ElementRef<HTMLDivElement>;
  @ViewChild('infoQ') infoQRef: ElementRef<HTMLDivElement>;

  /** Tile information & display values */
  activeTileId: number;
  playerName = 'Tispyl';
  tileTitle = 'Startet das Spiel!';
  tileDescription: string;
  tileImgPath = '/assets/board/start.png';
  tileImgDynBg = "url('/assets/board/start.png')";

  /** Option values */
  optLightUp = true;
  optAutoOpen = true;

  /** Visibility state */
  displayState = 'SMALL';
  isInfHidden = true;
  isOptHidden = true;
  isLit = false;
  currentProgress = '0%';

  /** Auxiliary timer values */
  manuallyOpened = false;
  timer: Timer;

  /** Internals */
  private readonly callbackId = undefined;

  constructor(private gameState: GameStateService, private boardTiles: BoardTilesService, private fileManagement: FileService) {
    this.timer = new Timer(5000, 25, {
      onProgress: () => {
        this.currentProgress = `${Math.round((this.timer.getCurrentTime() * 100) / this.timer.getMaxTime())}%`;
      },
      onReset: () => {
        this.currentProgress = '0%';
      },
      onFinished: () => {
        this.displayState = 'SMALL';
      },
    });

    this.callbackId = gameState.registerMessageCallback(MessageType.GAME_MESSAGE, {
      filterSubType: GameActionType.showTile,
      f: (data: GameShowTile) => {
        if (data.action === GameActionType.showTile) {
          this.setActiveTile(data.tile);
          if (this.optLightUp) {
            this.lightUp();
          }
          if (this.optAutoOpen) {
            this.toggleDisplayState(true);
          }
        }
      },
    });
  }

  /** Popover close event handler */
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    /** Quick way out if nothing is visible */
    if (this.isOptHidden && this.isInfHidden) {
      return;
    }
    /** Close options menu on any clicks outside */
    if (this.optionsRef !== undefined && event.target !== this.optionsCogRef.nativeElement) {
      if (!this.optionsRef.nativeElement.contains(event.target as HTMLElement)) {
        this.isOptHidden = true;
      }
    }
    /** Close info box on any clicks outside */
    if (this.infoRef !== undefined && event.target !== this.infoQRef.nativeElement) {
      if (!this.infoRef.nativeElement.contains(event.target as HTMLElement)) {
        this.isInfHidden = true;
      }
    }
  }

  setActiveTile(tileId: number): void {
    this.playerName = this.gameState.getCurrentPlayerDisplayName();
    this.tileTitle = this.titleOf(tileId).toUpperCase();
    this.tileDescription = this.descriptionOf(tileId);
    this.tileImgPath = this.imgOf(tileId);
    this.tileImgDynBg = `url(${this.fileManagement.profilePictureSource(this.gameState.getCurrentPlayerLogin())})`;
  }

  /** Switched between large and small display state while maintaining the corresponding timer */
  toggleDisplayState(startTimer: boolean): void {
    if (this.timer.isActive()) {
      this.timer.reset();
    }

    if (startTimer) {
      if (this.manuallyOpened) {
        return;
      }
      this.timer.start();
      this.displayState = 'LARGE';
    } else {
      this.manuallyOpened = !startTimer && this.displayState === 'SMALL';
      this.displayState = this.displayState === 'LARGE' ? 'SMALL' : 'LARGE';
    }
  }

  private titleOf(index: number): string {
    const tile = this.boardTiles.getTile(index);
    return tile === undefined ? 'ERROR!' : tile.title;
  }

  private descriptionOf(index: number): string {
    const tile = this.boardTiles.getTile(index);
    return tile === undefined ? 'ERROR!' : tile.description;
  }

  private imgOf(index: number): string {
    const tile = this.boardTiles.getTile(index);
    return tile === undefined ? '/assets/board/default.png' : tile.imageUrl;
  }

  private lightUp(): void {
    if (!this.isLit) {
      this.isLit = true;
      setTimeout(() => {
        this.isLit = false;
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.gameState.clearMessageCallback(this.callbackId);
  }
}
