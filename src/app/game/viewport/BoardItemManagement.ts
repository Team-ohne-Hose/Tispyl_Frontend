import {ViewportComponent} from './viewport.component';
import * as THREE from 'three';
import {SceneBuilderService} from '../../services/scene-builder.service';
import {PhysicsCommands} from './PhysicsCommands';
import {GameActionType, GameSetTile, MessageType} from '../../model/WsData';
import {ColyseusClientService} from '../../services/colyseus-client.service';

export enum BoardItemRole {
  Dice = 1,
  figure,
  marker
}
export interface BoardItem {
  mesh: THREE.Mesh;
  role: BoardItemRole;
}
export class BoardItemManagement {

  private diceStillOffset = 0.1; // max Velocity for dice to be recognised as still
  private sqrtHalf = Math.sqrt(.5);
  private checkDiceTriggered = false;

  boardItems: BoardItem[];
  board: THREE.Mesh;
  scene: THREE.Scene;
  markerGeo = new THREE.ConeBufferGeometry(1, 10, 15, 1, false, 0, 2 * Math.PI);

  constructor(scene: THREE.Scene,
              private sceneBuilder: SceneBuilderService,
              private physics: PhysicsCommands,
              private colyseus: ColyseusClientService) {
    this.scene = scene;
    this.boardItems = [];
  }

  // returns rolled dice number, -1 for not stable/initialized, -2 for even more unstable
  getDiceNumber(): number {
    if (this.physics.dice !== undefined) {
      if (true) { // TODO: check for moving dice
        const diceOrientationUp = new THREE.Vector3(0, 1, 0).normalize().applyQuaternion(this.physics.dice.quaternion);
        const diceOrientationLeft = new THREE.Vector3(1, 0, 0).normalize().applyQuaternion(this.physics.dice.quaternion);
        const diceOrientationFwd = new THREE.Vector3(0, 0, 1).normalize().applyQuaternion(this.physics.dice.quaternion);
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
    console.log('throwing Dice', this.physics.dice, PhysicsCommands.getPhysId(this.physics.dice));
    if (this.physics.dice !== undefined) {
      const physIdDice = PhysicsCommands.getPhysId(this.physics.dice);
      this.physics.setPosition(physIdDice, 0, 40, 0);
      // this.physics.setRotation(physIdDice, 0, 0, 0, 1);

      const vel = new THREE.Vector3(Math.random() - 0.5, Math.random() / 10, Math.random() - 0.5);
      const rot = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      vel.normalize().multiplyScalar(Math.random() * 35);
      rot.multiplyScalar(Math.PI);
      this.physics.setVelocity(physIdDice, vel.x, vel.y, vel.z);
      this.physics.setAngularVelocity(physIdDice, rot.x, rot.y, rot.z);
    }
  }

  hoverGameFigure(object: THREE.Object3D, x: number, y: number) {
    // this.physics.setRotation(PhysicsCommands.getPhysId(object), 0, 0, 0, 1);
    this.physics.setPosition(PhysicsCommands.getPhysId(object), x, 10, y);
  }
  moveGameFigure(object: THREE.Object3D, fieldID: number) {
    console.log('move Figure to ', fieldID);
    this.colyseus.getActiveRoom().subscribe( room => {
      const msg: GameSetTile = {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.setTile,
        figureId: object.id,
        playerId: room.sessionId,
        tileId: fieldID};
      room.send(msg);
    });

    for (const itemKey in this.boardItems) {
      if (this.boardItems[itemKey].mesh === object) {
        console.log('found Item, role is: ', this.boardItems[itemKey].role);
        // const newField = BoardCoordConversion.getFieldCenter(fieldID);
        // this.boardItems[itemKey].mesh.position.set(newField.x, 10, newField.y);
        if (object !== undefined) {
          this.physics.setKinematic(PhysicsCommands.getPhysId(object), false);
        }
      }
    }
  }

  addFlummi(x: number, y: number, z: number, color: number) {
    // const geometry = new THREE.SphereGeometry( 2, 32, 32 );
    const geometry = new THREE.SphereBufferGeometry( 2, 32, 32 );
    const material = new THREE.MeshStandardMaterial( {color: color} );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(x, y, z);
    // this.scene.add( sphere );
    // TODO rebuild Flummis, because important
    // this.physics.setVelocity(physId, (2 * Math.random() - 1) * 15, Math.random() * 15, (2 * Math.random() - 1) * 15);
  }
  addMarker(x: number, y: number, z: number, col: number): void {
    // TODO rebuild Marker, because important
    const markerMat = new THREE.MeshStandardMaterial({color: col});
    const marker = new THREE.Mesh(this.markerGeo, markerMat);
    marker.castShadow = true;
    marker.receiveShadow = true;
    marker.position.x = x;
    marker.position.y = y + this.markerGeo.parameters.height / 2;
    marker.position.z = z;
    console.log('new Marker at: ', x, y, marker.position.z);
    marker.rotateX(Math.PI);
    // this.scene.add(marker);
    // this.boardItems.push({mesh: marker, role: BoardItemRole.marker, removeBy: Date.now() + 10000});
  }
}
