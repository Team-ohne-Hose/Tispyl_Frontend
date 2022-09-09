import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameSettingsService } from 'src/app/services/game-settings.service';

@Component({
  selector: 'app-menu-settings-volume-slider',
  templateUrl: './volume-slider.component.html',
  styleUrls: ['./volume-slider.component.css'],
})
export class VolumeSlider implements OnInit, OnDestroy {
  public MAX_VOLUME = 1;
  public MIN_VOLUME = 0;
  public VOLUME_STEPS = 0.05;

  volumeMusic: number;
  volumeSoundEffects: number;

  private subscriptionVolume: Subscription;
  private subscriptionSoundEffects: Subscription;

  constructor(public gss: GameSettingsService) {}

  ngOnInit(): void {
    this.subscriptionVolume = this.gss.musicVolume.subscribe((volume: number) => {
      this.volumeMusic = volume;
    });
    this.subscriptionSoundEffects = this.gss.soundEffectVolume.subscribe((volume: number) => {
      this.volumeSoundEffects = volume;
    });

    this.volumeMusic = this.gss.musicVolume.getValue();
    this.volumeSoundEffects = this.gss.soundEffectVolume.getValue();
  }

  ngOnDestroy(): void {
    this.subscriptionVolume.unsubscribe();
    this.subscriptionSoundEffects.unsubscribe();
  }

  public setVolume(newVolume: number) {
    this.gss.musicVolume.next(newVolume);
  }

  public handleChangeVolume(event: Event) {
    if (event && event.target && event.target instanceof HTMLInputElement) {
      this.gss.musicVolume.next(event.target.valueAsNumber);
    }
  }

  public handleChangeSoundEffectVolume(event: Event) {
    if (event && event.target && event.target instanceof HTMLInputElement) {
      this.gss.soundEffectVolume.next(event.target.valueAsNumber);
    }
  }
}
