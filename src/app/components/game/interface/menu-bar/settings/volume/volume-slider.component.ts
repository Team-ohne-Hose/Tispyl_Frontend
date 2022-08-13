import { Component } from '@angular/core';
import { GameSettingsService } from 'src/app/services/game-settings.service';

@Component({
  selector: 'app-menu-settings-volume-slider',
  templateUrl: './volume-slider.component.html',
})
export class VolumeSlider {
  public MAX_VOLUME = 1;
  public MIN_VOLUME = 0;
  public VOLUME_STEPS = 0.2;

  constructor(public GSS: GameSettingsService) {}

  public setVolume(newVolume: number) {
    this.GSS.volume.emit(newVolume);
  }

  public toggleMuted() {
    this.GSS.isMuted.emit(!this.GSS.isMuted);
  }

  public handleChangeVolume(event: { target: HTMLInputElement }) {
    this.GSS.volume.emit(event.target.valueAsNumber);
  }

  public handleChangeMusicVolume(event: { target: HTMLInputElement }) {
    this.GSS.musicVolume.emit(event.target.valueAsNumber);
  }
}
