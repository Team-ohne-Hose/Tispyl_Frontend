import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject, Subscription, take } from 'rxjs';
import { Player } from 'src/app/model/state/Player';
import { MessageType, PlayerMessageType, SetFigure } from 'src/app/model/WsData';
import { GameStateService } from 'src/app/services/game-state.service';
import { ObjectLoaderService } from 'src/app/services/object-loader/object-loader.service';

@Component({
  selector: 'app-menu-bottle-cap-picker',
  templateUrl: './bottle-cap-picker.component.html',
  styleUrls: ['./bottle-cap-picker.component.css'],
})
export class BottleCapPickerComponent implements OnInit, OnDestroy {
  protected bottleCapUrl: string;
  private numberOfBottleCaps$: ReplaySubject<number> = new ReplaySubject<number>(1);
  private currentCapId = 0;
  private player: Player;

  // subscriptions
  private player$$: Subscription;
  private numberOfBottleCaps$$: Subscription;

  constructor(private objectLoaderService: ObjectLoaderService, private gameStateService: GameStateService) {
    this.numberOfBottleCaps$$ = this.objectLoaderService.getBCapCount().subscribe((n) => this.numberOfBottleCaps$.next(n));
  }

  ngOnInit(): void {
    this.player$$ = this.gameStateService.getMe$().subscribe((player: Player) => {
      this.player = player;
    });
    this.objectLoaderService.getBCapTextureThumbPath(this.currentCapId).subscribe((suc) => {
      this.bottleCapUrl = suc;
    });
  }

  ngOnDestroy(): void {
    this.player$$.unsubscribe();
    this.numberOfBottleCaps$$.unsubscribe();
  }

  nextBCap(): void {
    this.numberOfBottleCaps$.pipe(take(1)).subscribe((n) => {
      this.currentCapId++;
      if (this.currentCapId > n - 1) {
        this.currentCapId = 0;
      }
      this.setBCap();
    });
  }

  prevBCap(): void {
    this.numberOfBottleCaps$.pipe(take(1)).subscribe((n) => {
      this.currentCapId = this.currentCapId - 1;
      if (this.currentCapId < 0) {
        this.currentCapId = n - 1;
      }
      this.setBCap();
    });
  }

  private setBCap(): void {
    this.objectLoaderService.getBCapTextureThumbPath(this.currentCapId).subscribe((suc) => {
      this.bottleCapUrl = suc;
      const msg: SetFigure = {
        type: MessageType.PLAYER_MESSAGE,
        subType: PlayerMessageType.setFigure,
        playerId: this.player.loginName,
        playerModel: this.currentCapId,
      };
      this.gameStateService.sendMessage(MessageType.PLAYER_MESSAGE, msg);
    });
  }
}
