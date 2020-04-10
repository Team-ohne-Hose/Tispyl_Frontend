import {Camera} from 'three';
import * as THREE from 'three';


export class CameraControl {
  cam: Camera;
  constructor(c: Camera) {
    this.cam = c;
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
