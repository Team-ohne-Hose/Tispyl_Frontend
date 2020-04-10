import {ViewportComponent} from './viewport.component';
import * as THREE from 'three';

export enum BoardItemRole {
  Dice = 1,
  figure,
  marker
}
export interface BoardItem {
  mesh: THREE.Mesh;
  role: BoardItemRole;
  removeBy: number;
}
export class BoardItemManagment {

  myView: ViewportComponent;
  boardItems: BoardItem[];
  board: THREE.Mesh;
  scene: THREE.Scene;
  markerGeo = new THREE.ConeGeometry(1, 10, 15, 1, false, 0, 2 * Math.PI);


  constructor( scene: THREE.Scene) {
    this.scene = scene;
    this.boardItems = [];
  }

  addMarker(x: number, y: number, z: number, col: number): void {
    const markerMat = new THREE.MeshPhysicalMaterial({color: col});
    const marker = new THREE.Mesh(this.markerGeo, markerMat);
    marker.castShadow = true;
    marker.receiveShadow = true;
    marker.position.x = x;
    marker.position.y = y + this.markerGeo.parameters.height / 2;
    marker.position.z = z;
    console.log('new Marker at: ', x, y, marker.position.z);
    marker.rotateX(Math.PI);
    this.scene.add(marker);
    this.boardItems.push({mesh: marker, role: BoardItemRole.marker, removeBy: Date.now() + 10000});
  }
  removeToDelete() {
    for (const item in this.boardItems) {
      if (this.boardItems[item].removeBy > 0 && this.boardItems[item].removeBy <= Date.now()) {
        this.scene.remove(this.boardItems[item].mesh);
      }
    }
  }
}
