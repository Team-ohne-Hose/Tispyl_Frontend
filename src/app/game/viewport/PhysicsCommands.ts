import * as THREE from 'three';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {DataChange} from '@colyseus/schema';
import {
  MessageType,
  PhysicsCommand,
  PhysicsCommandAngular,
  PhysicsCommandKinematic,
  PhysicsCommandPosition,
  PhysicsCommandQuat,
  PhysicsCommandRemove,
  PhysicsCommandType,
  PhysicsCommandVelocity
} from '../../model/WsData';
import {GameState, PhysicsObjectState} from '../../model/GameState';
import {Room} from 'colyseus.js';
import {ViewportComponent} from './viewport.component';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

export enum CollisionGroups {
  All = 15,
  Other = 1,
  Plane = 2,
  Figures = 4,
  Dice = 8
}
export class PhysicsCommands {
  disposeFromViewport: (id: number) => void;
  scene: THREE.Scene;
  colyseus: ColyseusClientService;
  constructor(colyseus: ColyseusClientService) {
    this.colyseus = colyseus;
   this.colyseus.getActiveRoom().subscribe((activeRoom: Room<GameState>) => {
      activeRoom.state.physicsState.objects.onChange = (item: PhysicsObjectState, key: string) => {
        const obj = ViewportComponent.getObjectByPhysId(this.scene, item.objectIDTHREE);
        // console.log('query for physId', item.objectIDTHREE, obj);
        obj.position.set(item.position.x, item.position.y, item.position.z);
        obj.quaternion.set(item.quaternion.x, item.quaternion.y, item.quaternion.z, item.quaternion.w);
        // console.log('new Position: ', key, item.position.x, item.position.y, item.position.z, item.position);
        // console.log("rotation is: ", item.quaternion.x, item.quaternion.y, item.quaternion.z, item.quaternion.w);
      };
    });
  }
  setKinematic(physId: number, enabled: boolean) {
    console.log('setting kinematic ', physId, enabled);
    const msg: PhysicsCommandKinematic = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.kinematic,
      objectID: physId,
      kinematic: enabled
    };
    this.sendMessage(msg);
  }
  setPositionVec(physId: number, vec: THREE.Vector3) {
    this.setPosition(physId, vec.x, vec.y, vec.z);
  }
  setPosition(physId: number, x: number, y: number, z: number) {
    const msg: PhysicsCommandPosition = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.position,
      objectID: physId,
      positionX: x,
      positionY: y,
      positionZ: z
    };
    this.sendMessage(msg);
  }
  setRotationQuat(physId, quat: THREE.Quaternion) {
    this.setRotation(physId, quat.x, quat.y, quat.z, quat.w);
  }
  setRotation(physId: number, x: number, y: number, z: number, w: number) {
    const msg: PhysicsCommandQuat = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.quaternion,
      objectID: physId,
      quaternionX: x,
      quaternionY: y,
      quaternionZ: z,
      quaternionW: w
    };
    this.sendMessage(msg);
  }
  setVelocity(physId: number, x: number, y: number, z: number) {
    const msg: PhysicsCommandVelocity = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.velocity,
      objectID: physId,
      velX: x,
      velY: y,
      velZ: z
    };
    this.sendMessage(msg);
  }
  setAngularVelocity(physId: number, x: number, y: number, z: number) {
    const msg: PhysicsCommandAngular = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.angularVelocity,
      objectID: physId,
      angularX: x,
      angularY: y,
      angularZ: z,
    };
    this.sendMessage(msg);
  }

  addMesh(test: string, mesh: THREE.Mesh, mass: number, onCreation?: (physId: number) => void, cGroup?: CollisionGroups, cMask?: CollisionGroups, onDelete?: number) {
    console.log('creating ', test, mesh.name);
    // const geo = mesh.geometry.clone();
    // const buffGeo = geo instanceof THREE.BufferGeometry ? geo : new THREE.BufferGeometry().fromGeometry(geo);
    /*
      mesh.userData.physId = phys;
      console.log('setting Id to ', test, phys, mesh.name, mesh.id);
      this.addObject(phys, buffGeo, mesh.position.x, mesh.position.y, mesh.position.z, mass, cGroup, cMask, onDelete);
      if (onCreation !== undefined) {
        onCreation(phys);
      }
    });
    */
  }
  removePhysics(physId: number) {
    const cmd: PhysicsCommandRemove = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.remove,
      objectID: physId,
    };
  }
  private sendMessage(msg: PhysicsCommand) {
    this.colyseus.getActiveRoom().subscribe( room => {
      if (msg !== undefined) {
        room.send(msg);
      }
    });
  }
}

class AddMeshHelper {
  myText = 'untitled';
  constructor(myText: string) {
    this.myText = String(myText);
  }
  onNum(num: number) {
    console.log('setting Id to ', this.myText, num);
  }
}
