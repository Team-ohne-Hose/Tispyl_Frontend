import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  public static OWN_TURN_SOUND = 'own_turn';
  public static FOREIGN_TURN_SOUND = 'others_turn';
  public static WAKE_PLAYER = 'wake_player';

  private assetPath = '../../../assets/sounds/';
  private html5Audio: HTMLAudioElement = new Audio();

  private volume = 1;

  private sounds: Map<string, string> = new Map<string, string>([
    ['own_turn', '234564__foolboymedia__notification-up-i.wav'],
    ['others_turn', '414437__inspectorj__dropping-metal-pin-on-wood-a.wav'],
    ['wake_player', 'dbischoff__wakePlayer.wav'],
  ]);

  play(soundName: string): void {
    if (this.sounds.has(soundName)) {
      this.html5Audio.setAttribute('src', this.assetPath + this.sounds.get(soundName));
      this.html5Audio.load();
      this.html5Audio.volume = 1;
      this.html5Audio.play();
    } else {
      console.warn('No sound known for name: ', soundName);
    }
  }

  setVolume(newVolume: number): void {
    this.volume = newVolume;
  }
}
