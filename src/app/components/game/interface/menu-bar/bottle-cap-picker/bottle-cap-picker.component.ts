import { Component } from '@angular/core';
import { Player } from 'src/app/model/state/Player';
import { MessageType, PlayerMessageType, PlayerModel, SetFigure } from 'src/app/model/WsData';
import { GameStateService } from 'src/app/services/game-state.service';
import { ObjectLoaderService } from 'src/app/services/object-loader/object-loader.service';

@Component({
  selector: 'app-menu-bottle-cap-picker',
  templateUrl: './bottle-cap-picker.component.html',
  styleUrls: ['./bottle-cap-picker.component.css'],
})
export class BottleCapPickerComponent {
  bottleCapUrl: string;
  numberOfBottleCaps: number;
  currentCapId: PlayerModel;
  player: Player;

  constructor(private objectLoaderService: ObjectLoaderService, private gameStateService: GameStateService) {
    this.player = this.gameStateService.getMe();
    this.currentCapId = this.player.figureModel || PlayerModel.bcap_NukaCola;
    this.bottleCapUrl = this.objectLoaderService.getBCapTextureThumbPath(this.currentCapId);
    this.numberOfBottleCaps = this.objectLoaderService.getBCapCount();
  }

  nextBCap($event: Event): void {
    this.currentCapId++;
    if (this.currentCapId > this.numberOfBottleCaps) {
      this.currentCapId = 1;
    }
    this.setBCap();
  }

  prevBCap($event: Event): void {
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
      playerId: this.gameStateService.getMyLoginName(),
      playerModel: this.currentCapId,
    };
    this.gameStateService.sendMessage(MessageType.PLAYER_MESSAGE, msg);
  }
}
