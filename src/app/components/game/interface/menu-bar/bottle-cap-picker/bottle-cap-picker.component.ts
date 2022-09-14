import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/model/state/Player';
import { MessageType, PlayerMessageType, PlayerModel, SetFigure } from 'src/app/model/WsData';
import { GameStateService } from 'src/app/services/game-state.service';
import { ObjectLoaderService } from 'src/app/services/object-loader/object-loader.service';

@Component({
  selector: 'app-menu-bottle-cap-picker',
  templateUrl: './bottle-cap-picker.component.html',
  styleUrls: ['./bottle-cap-picker.component.css'],
})
export class BottleCapPickerComponent implements OnInit, OnDestroy {
  protected bottleCapUrl: string;
  private numberOfBottleCaps: number;
  private currentCapId: PlayerModel;
  private player: Player;

  // subscriptions
  private player$$: Subscription;

  constructor(private objectLoaderService: ObjectLoaderService, private gameStateService: GameStateService) {
    this.numberOfBottleCaps = this.objectLoaderService.getBCapCount();
  }

  ngOnInit(): void {
    this.player$$ = this.gameStateService.getMe$().subscribe((player: Player) => {
      this.player = player;
      this.currentCapId = player.figureModel || PlayerModel.bcap_NukaCola;
      this.bottleCapUrl = this.objectLoaderService.getBCapTextureThumbPath(this.currentCapId);
    });
  }

  ngOnDestroy(): void {
    this.player$$.unsubscribe();
  }

  nextBCap(): void {
    this.currentCapId++;
    if (this.currentCapId > this.numberOfBottleCaps) {
      this.currentCapId = 1;
    }
    this.setBCap();
  }

  prevBCap(): void {
    this.currentCapId--;
    if (this.currentCapId < 1) {
      this.currentCapId = this.numberOfBottleCaps;
    }
    this.setBCap();
  }

  private setBCap(): void {
    this.bottleCapUrl = this.objectLoaderService.getBCapTextureThumbPath(this.currentCapId);

    const msg: SetFigure = {
      type: MessageType.PLAYER_MESSAGE,
      subType: PlayerMessageType.setFigure,
      playerId: this.player.loginName,
      playerModel: this.currentCapId,
    };
    this.gameStateService.sendMessage(MessageType.PLAYER_MESSAGE, msg);
  }
}
