import {ViewportComponent} from './viewport.component';
import * as THREE from 'three';
import {SceneBuilderService} from '../../services/scene-builder.service';
import {BoardCoordConversion} from './BoardCoordConversion';
import {PhysicsEngine} from './PhysicsEngine';

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
  dice: THREE.Mesh;
  scene: THREE.Scene;
  markerGeo = new THREE.ConeBufferGeometry(1, 10, 15, 1, false, 0, 2 * Math.PI);


  constructor(scene: THREE.Scene, private sceneBuilder: SceneBuilderService, private physics: PhysicsEngine) {
    this.scene = scene;
    this.boardItems = [];
  }

  listDebugPhysicsItems() {
    this.physics.listBodies();
  }

  throwDice() {
    console.log('throwing Dice');
    if (this.dice !== undefined) {
      this.dice.position.set(0, 40, 0);
      // TODO: redo axial throw
      // this.dice.rotationalAxis.copy(new THREE.Vector3(1, 1, 0).normalize());
      // this.dice.rotationalVelocity = (1 + 15 * Math.random()) * Math.PI;
      // const velocityVec = new THREE.Vector3(Math.random() - 0.5, Math.random() / 10, Math.random() - 0.5).normalize();
      // this.dice.velocity.copy(velocityVec.multiplyScalar(Math.random() * 40));
      console.log('..', this.dice, this.scene);
    }
  }
  moveGameFigure(object: THREE.Object3D, fieldID: number) {
    console.log('move Figure to ', fieldID);
    for (const itemKey in this.boardItems) {
      if (this.boardItems[itemKey].mesh === object) {
        console.log('found Item, role is: ', this.boardItems[itemKey].role);
        const newField = BoardCoordConversion.getFieldCenter(fieldID);
        this.boardItems[itemKey].mesh.position.set(newField.x, 10, newField.y);
        if (object !== undefined && object.userData.physicsBody !== undefined) {
          // TODO make correct ammo call
          object.userData.physicsBody.physicsEnabled = true;
        }
      }
    }
  }

  addGameFigure() {
    const figure = this.sceneBuilder.generateGameFigure(0x004412);
    const startPos = BoardCoordConversion.getFieldCenter(0);
    figure.position.set(startPos.x, 8, startPos.y);

    this.boardItems.push({mesh: figure, role: BoardItemRole.figure, removeBy: undefined});
    this.scene.add(figure);
    // TODO redo mass
    const pObj = this.physics.addMesh(figure, 1);
  }

  addFlummi(x: number, y: number, z: number, color: number) {
    // const geometry = new THREE.SphereGeometry( 2, 32, 32 );
    const geometry = new THREE.SphereBufferGeometry( 2, 32, 32 );
    const material = new THREE.MeshStandardMaterial( {color: color} );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(x, y, z);
    this.scene.add( sphere );
    // TODO redo mass
    this.physics.addMesh(sphere, 1);
    if (sphere !== undefined && sphere.userData.physicsBody !== undefined) {
      // TODO make correct ammo call
      // sphere.userData.physicsBody.velocity.set((2 * Math.random() - 1) * 15, Math.random() * 15, (2 * Math.random() - 1) * 15);
    }
  }

  addMarker(x: number, y: number, z: number, col: number): void {
    const markerMat = new THREE.MeshStandardMaterial({color: col});
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
