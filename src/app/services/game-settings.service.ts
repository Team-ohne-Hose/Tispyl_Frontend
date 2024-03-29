import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

export enum StorageKey {
  VolumeMusic = 'volume_music',
  VolumeSoundEffects = 'volume_sound_effects',
  PersistNamePlates = 'persistent_name_plates',
}

@Injectable({
  providedIn: 'root',
})
export class GameSettingsService implements OnDestroy {
  // Volume
  musicVolume: BehaviorSubject<number> = new BehaviorSubject<number>(this.getValueFromLocalStroage(StorageKey.VolumeMusic) ?? 0.5);

  soundEffectVolume: BehaviorSubject<number> = new BehaviorSubject<number>(0.5);

  // Display
  persistentNamePlates: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Subscriptions
  private persistNamePlates$$: Subscription;
  private volume$$: Subscription;
  private soundEffects$$: Subscription;

  constructor() {
    this.persistentNamePlates.next(this.getValueFromLocalStroage(StorageKey.PersistNamePlates) ?? false);
    this.soundEffectVolume.next(this.getValueFromLocalStroage(StorageKey.VolumeSoundEffects) ?? 0.5);

    this.persistNamePlates$$ = this.persistentNamePlates.subscribe((isPersistent) => {
      this.setValueInLocalStorage(StorageKey.PersistNamePlates, isPersistent);
    });
    this.volume$$ = this.musicVolume.subscribe((volume) => {
      this.setValueInLocalStorage(StorageKey.VolumeMusic, volume);
    });
    this.soundEffects$$ = this.soundEffectVolume.subscribe((volume) => {
      this.setValueInLocalStorage(StorageKey.VolumeSoundEffects, volume);
    });
  }

  ngOnDestroy(): void {
    this.persistNamePlates$$.unsubscribe();
    this.volume$$.unsubscribe();
    this.soundEffects$$.unsubscribe();
  }

  getValueFromLocalStroage(key: StorageKey) {
    return JSON.parse(localStorage.getItem(key));
  }

  setValueInLocalStorage(key: StorageKey, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
    }
  }
}
