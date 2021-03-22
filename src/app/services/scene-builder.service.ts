import {Injectable} from '@angular/core';
import * as THREE from 'three';
import {GameBoardOrbitControl} from '../components/game/viewport/helpers/GameBoardOrbitControl';

@Injectable({
  providedIn: 'root'
})
export class SceneBuilderService {
  constructor() {
  }

  generateSpotLight(): THREE.SpotLight {
    const light = new THREE.SpotLight(0xffffff, 9, 0, 0.7, 0.45, 0.02);
    light.position.set(-60, 50, -90);


    return light;
  }
  generateGameBoardOrbitControls(cam: THREE.PerspectiveCamera, domElem: HTMLElement): GameBoardOrbitControl {
    const orbitCtrl = new GameBoardOrbitControl(cam, domElem);
    orbitCtrl.enablePan = false;
    orbitCtrl.mouseButtons = {
      LEFT: undefined, // THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };
    orbitCtrl.dollyMinAngle = Math.PI * 0.48;
    orbitCtrl.dollyMaxAngle = Math.PI * 0.2;
    orbitCtrl.dollyCurvature = 1;
    orbitCtrl.useDollyAngle = true;
    orbitCtrl.minDistance = 10;
    orbitCtrl.maxDistance = 100;
    orbitCtrl.enableTargetOffset = true;
    orbitCtrl.targetOffsetRatio = 25;
    orbitCtrl.minTargetOffset = 0;
    orbitCtrl.maxTargetOffset = 55;


    orbitCtrl.update();
    return orbitCtrl;
  }
}
