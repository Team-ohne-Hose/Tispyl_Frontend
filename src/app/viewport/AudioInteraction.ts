import {ViewportComponent} from './viewport.component';
import * as THREE from 'three';
import {AudioLoader, Camera} from 'three';

export class AudioInteraction {

  myView: ViewportComponent;

  // Sound
  listener = new THREE.AudioListener();
  sound = new THREE.Audio(this.listener);
  audioLoader = new AudioLoader();

  constructor( view: ViewportComponent) {
    this.myView = view;
  }

  initAudio(cam: Camera) {
    cam.add(this.listener);
  }
  playAudio() {
    this.audioLoader.load('/assets/ourAnthem.ogg', (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setLoop(true);
      this.sound.setVolume(0.5);
      this.sound.play();
    });
  }
}
