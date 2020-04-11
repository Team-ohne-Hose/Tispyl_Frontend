import {ViewportComponent} from './viewport.component';
import * as THREE from 'three';
import {SceneBuilderService} from '../scene-builder.service';
import {BoardCoordConversion} from './BoardCoordConversion';

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


  constructor(scene: THREE.Scene, private sceneBuilder: SceneBuilderService) {
    this.scene = scene;
    this.boardItems = [];
  }

  moveGameFigure(object: THREE.Object3D, fieldID: number) {
    console.log('move Figure to ', fieldID);
    for (const itemKey in this.boardItems) {
      if (this.boardItems[itemKey].mesh === object) {
        console.log('found Item, role is: ', this.boardItems[itemKey].role);
        const newField = BoardCoordConversion.getFieldCenter(fieldID);
        this.boardItems[itemKey].mesh.position.set(newField.x, 1.1, newField.y);
      }
    }
  }

  addGameFigure() {
    const figure = this.sceneBuilder.generateGameFigure(0x004412);
    const startPos = BoardCoordConversion.getFieldCenter(0);
    figure.position.set(startPos.x, 1.1, startPos.y);

    this.boardItems.push({mesh: figure, role: BoardItemRole.figure, removeBy: undefined});
    this.scene.add(figure);
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
