import { AfterViewInit, EventEmitter, Injectable, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

export enum StorageKey {
  VolumeMusic = 'volume_music',
  VolumeSoundEffects = 'volume_sound_effects',
  PersistNamePlates = 'persistant_name_plates',
}

@Injectable({
  providedIn: 'root',
})
export class GameSettingsService implements OnDestroy {
  // Volume
  musicVolume: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.getValueFromLocalStroage(StorageKey.VolumeMusic) ?? 0.5
  );

  soundEffectVolume: BehaviorSubject<number> = new BehaviorSubject<number>(0.5);

  // Display
  persistentNamePlates: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Subscriptions
  private subPersistNamePlates: Subscription;
  private subVolume: Subscription;
  private subSoundEffects: Subscription;

  constructor() {
    console.log('Hi Sett.');
    this.persistentNamePlates.next(this.getValueFromLocalStroage(StorageKey.PersistNamePlates) ?? false);
    this.soundEffectVolume.next(this.getValueFromLocalStroage(StorageKey.VolumeSoundEffects) ?? 0.5);

    this.subPersistNamePlates = this.persistentNamePlates.subscribe((isPersistent) => {
      this.setValueInLocalStorage(StorageKey.PersistNamePlates, isPersistent);
    });
    this.subVolume = this.musicVolume.subscribe((volume) => {
      console.log(volume);
      this.setValueInLocalStorage(StorageKey.VolumeMusic, volume);
    });
    this.subSoundEffects = this.soundEffectVolume.subscribe((volume) => {
      console.log(volume);
      this.setValueInLocalStorage(StorageKey.VolumeSoundEffects, volume);
    });
  }

  ngOnDestroy(): void {
    this.subPersistNamePlates.unsubscribe();
    this.subVolume.unsubscribe();
    this.subSoundEffects.unsubscribe();
  }

  getValueFromLocalStroage(key: StorageKey) {
    return JSON.parse(localStorage.getItem(key));
  }

  setValueInLocalStorage(key: StorageKey, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err: any) {
      console.error(err);
    }
  }
}
