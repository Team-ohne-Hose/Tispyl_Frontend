import { Component } from '@angular/core';
import { GameSettingsService } from 'src/app/services/game-settings.service';

@Component({
  selector: 'app-menu-settings-volume-slider',
  templateUrl: './volume-slider.component.html',
})
export class VolumeSlider {
  constructor(public GSS: GameSettingsService) {}

  public setVolume(newVolume: number) {
    this.GSS.volume.emit(newVolume);
  }

  public toggleMuted() {
    this.GSS.isMuted.emit(!this.GSS.isMuted);
  }

  public handleChangeVolume(event: { target: HTMLInputElement }) {
    this.setVolume(event.target.valueAsNumber);
  }
}
