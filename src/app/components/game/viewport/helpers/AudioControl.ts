import { Subscription } from 'rxjs';
import { GameSettingsService } from 'src/app/services/game-settings.service';
import * as THREE from 'three';

export class AudioControl {
  // Sound
  listener = new THREE.AudioListener();
  sound = new THREE.Audio(this.listener);
  audioLoader = new THREE.AudioLoader();

  musicVolumeSubscription: Subscription;

  constructor(public gss: GameSettingsService) {
    this.musicVolumeSubscription = this.gss.musicVolume.subscribe((volume) => {
      this.sound.setVolume(volume);
    });
  }

  initAudio(cam: THREE.Camera): void {
    cam.add(this.listener);
  }

  playAudio(): void {
    this.audioLoader.load('/assets/ourAnthem.ogg', (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setLoop(true);
      this.sound.setVolume(0.5);
      this.sound.play();
    });
  }
}
