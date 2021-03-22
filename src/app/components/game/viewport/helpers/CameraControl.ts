import { PerspectiveCamera } from 'three';
import * as THREE from 'three';
import { GameBoardOrbitControl } from './GameBoardOrbitControl';


export class CameraControl {
  cam: PerspectiveCamera;
  controls: GameBoardOrbitControl;

  constructor(c: PerspectiveCamera, ctrl: GameBoardOrbitControl) {
    this.cam = c;
    this.controls = ctrl;
  }

  lookAtPosition(pos: THREE.Vector3, angle: THREE.Vector3, distance: number) {
    const p2 = angle.clone().normalize().multiplyScalar(-distance).add(pos.clone());
    this.cam.position.set(p2.x, p2.y, p2.z);
    this.controls.update();
    this.controls.target.set(pos.x, pos.y, pos.z);
    this.controls.update();
  }

  lookAtField(tileId: number) {
    // TODO
  }

  lookAtOverview() {
    // TODO
  }

  getPosition(): THREE.Vector3 {
    return this.cam.position;
  }
}
