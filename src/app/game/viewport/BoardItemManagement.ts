import {ViewportComponent} from './viewport.component';
import * as THREE from 'three';
import {SceneBuilderService} from '../../services/scene-builder.service';
import {BoardCoordConversion} from './BoardCoordConversion';
import Ammo from 'ammojs-typed';
import {PhysicsCommands} from './PhysicsCommands';

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
export class BoardItemManagement {

  private diceStillOffset = 0.1; // max Velocity for dice to be recognised as still
  private sqrtHalf = Math.sqrt(.5);
  private checkDiceTriggered = false;

  gameFigureMass = 1;
  flummiMass = 1;

  myView: ViewportComponent;
  boardItems: BoardItem[];
  board: THREE.Mesh;
  dice: THREE.Mesh;
  scene: THREE.Scene;
  markerGeo = new THREE.ConeBufferGeometry(1, 10, 15, 1, false, 0, 2 * Math.PI);


  constructor(scene: THREE.Scene, private sceneBuilder: SceneBuilderService, private physics: PhysicsCommands) {
    this.scene = scene;
    this.boardItems = [];
    // this.physics.addOnUpdateCallback(this.checkDice.bind(this)); // TODO redo updateCallbacks
  }

  listDebugPhysicsItems() {
    // this.physics.listBodies(); // TODO redo listing Physics
  }
  // returns rolled dice number, -1 for not stable/initialized, -2 for even more unstable
  getDiceNumber(): number {
    if (this.dice !== undefined) {
      if (true) { // TODO: check for moving dice
        const diceOrientationUp = new THREE.Vector3(0, 1, 0).normalize().applyQuaternion(this.dice.quaternion);
        const diceOrientationLeft = new THREE.Vector3(1, 0, 0).normalize().applyQuaternion(this.dice.quaternion);
        const diceOrientationFwd = new THREE.Vector3(0, 0, 1).normalize().applyQuaternion(this.dice.quaternion);
        let diceNumber = -1;
        if (diceOrientationUp.y >= this.sqrtHalf) {
          diceNumber = 4;
        } else if (diceOrientationUp.y <= -this.sqrtHalf) {
          diceNumber = 3;
        } else if (diceOrientationLeft.y >= this.sqrtHalf) {
          diceNumber = 5;
        } else if (diceOrientationLeft.y <= -this.sqrtHalf) {
          diceNumber = 2;
        } else if (diceOrientationFwd.y >= this.sqrtHalf) {
          diceNumber = 1;
        } else if (diceOrientationFwd.y <= -this.sqrtHalf) {
          diceNumber = 6;
        }
        return diceNumber;
      } else {
        // console.log('dice too fast', PhysicsEngine.getPhys(this.dice).physicsBody.getLinearVelocity().length());
        return -1;
      }
    }
    // console.log('dice too undefined');
    return -1;
  }
  throwDice() {
    console.log('throwing Dice');
    if (this.dice !== undefined) {
      this.physics.setPosition(this.dice.id, 0, 40, 0);
      this.physics.setRotation(this.dice.id, 0, 0, 0, 1);
      // TODO: redo Velocity
      // const vel = new Ammo.btVector3(Math.random() - 0.5, Math.random() / 10, Math.random() - 0.5);
      // const rot = new Ammo.btVector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      // vel.normalize();
      // vel.op_mul(Math.random() * 35); // TODO: balance Dice speed
      // rot.op_mul(1 * Math.PI); // TODO: balance Dice rotation speed
      // phys.physicsBody.setLinearVelocity(vel);
      // phys.physicsBody.setAngularVelocity(rot);
    }
  }

  hoverGameFigure(object: THREE.Object3D, x: number, y: number) {
    this.physics.setKinematic(object.id, true);
    this.physics.setRotation(object.id, 0, 0, 0, 1);
    this.physics.setPosition(object.id, x, 10, y);
  }
  moveGameFigure(object: THREE.Object3D, fieldID: number) {
    console.log('move Figure to ', fieldID);
    for (const itemKey in this.boardItems) {
      if (this.boardItems[itemKey].mesh === object) {
        console.log('found Item, role is: ', this.boardItems[itemKey].role);
        // const newField = BoardCoordConversion.getFieldCenter(fieldID);
        // this.boardItems[itemKey].mesh.position.set(newField.x, 10, newField.y);
        if (object !== undefined) {
          this.physics.setKinematic(object.id, false);
        }
      }
    }
  }

  addGameFigure(color?: number) {
    color = color || Math.random() * 0xffffff;
    const figure = this.sceneBuilder.generateGameFigure(color);
    const startPos = BoardCoordConversion.getFieldCenter(0);
    figure.position.set(startPos.x, 8, startPos.y);

    this.boardItems.push({mesh: figure, role: BoardItemRole.figure, removeBy: undefined});
    this.scene.add(figure);
    this.physics.addMesh(figure, this.gameFigureMass, undefined, undefined);
    /* TODO: redo onDelete
    , (obj) => {
      this.physics.setPosition(figure.id, 0, 20, 0);
      return true;
    });*/
  }

  addFlummi(x: number, y: number, z: number, color: number) {
    // const geometry = new THREE.SphereGeometry( 2, 32, 32 );
    const geometry = new THREE.SphereBufferGeometry( 2, 32, 32 );
    const material = new THREE.MeshStandardMaterial( {color: color} );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(x, y, z);
    this.scene.add( sphere );
    this.physics.addMesh(sphere, this.flummiMass);
    // TODO: redo Velocity
    // const phys = PhysicsEngine.getPhys(sphere);
    // if (phys !== undefined) {
    // const vec = new Ammo.btVector3((2 * Math.random() - 1) * 15, Math.random() * 15, (2 * Math.random() - 1) * 15);
    // phys.physicsBody.setLinearVelocity(vec);
    // }
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
