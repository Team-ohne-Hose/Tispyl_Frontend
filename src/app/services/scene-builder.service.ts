import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GameBoardOrbitControl } from '../components/game/viewport/helpers/GameBoardOrbitControl';

@Injectable({
  providedIn: 'root',
})
export class SceneBuilderService {
  generateSpotLight(): THREE.SpotLight {
    const light = new THREE.SpotLight(0xffffff, 9, 0, 0.7, 0.45, 0.02);
    light.position.set(-60, 50, -90);

    return light;
  }

  generateGameBoardOrbitControls(cam: THREE.PerspectiveCamera, domElem: HTMLElement): GameBoardOrbitControl {
    const orbitCtrl = new GameBoardOrbitControl(cam, domElem);
    orbitCtrl.update();
    return orbitCtrl;
  }
}
