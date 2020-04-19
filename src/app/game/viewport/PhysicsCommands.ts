import * as THREE from 'three';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {DataChange} from '@colyseus/schema';
import {PhysicsCommand, PhysicsCommandType} from '../../model/WsData';
import {GameState, PhysicsObjectState} from '../../model/GameState';
import {Room} from 'colyseus.js';

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
  constructor(private colyseus: ColyseusClientService) {
    this.colyseus.addOnChangeCallback((changes: DataChange<any>[]) => {
      // console.log('datachanges for Physics: ');
      changes.forEach((change: DataChange<any>) => {
        if (change.field === 'physicsState') {
          // console.log('datachange Physics: ', change);
        }
      });
    });

    this.colyseus.getActiveRoom().subscribe((activeRoom: Room<GameState>) => {
      activeRoom.state.physicsState.objects.onChange = (item: PhysicsObjectState, key: string) => {
        console.log('new Position: ', key, item.position.x, item.position.y, item.position.z, item.position);
        this.scene.getObjectById(item.objectIDTHREE).position.set(item.position.x, item.position.y, item.position.z);
        this.scene.getObjectById(item.objectIDTHREE).quaternion.set(item.quaternion.x, item.quaternion.y, item.quaternion.z, item.quaternion.w);
      };
    });
  }

  setKinematic(id: number, enabled: boolean) {
    const cmd: PhysicsCommand = this.createEmptyMessage(id, PhysicsCommandType.kinematic);
    cmd.kinematic = enabled;
    this.sendMessage(cmd);
  }
  setPositionVec(id: number, vec: THREE.Vector3) {
    this.setPosition(id, vec.x, vec.y, vec.z);
  }
  setPosition(id: number, x: number, y: number, z: number) {
    const cmd: PhysicsCommand = this.createEmptyMessage(id, PhysicsCommandType.position);
    cmd.positionX = x;
    cmd.positionY = y;
    cmd.positionZ = z;
    this.sendMessage(cmd);
  }
  setRotationQuat(id, quat: THREE.Quaternion) {
    this.setRotation(id, quat.x, quat.y, quat.z, quat.w);
  }
  setRotation(id: number, x: number, y: number, z: number, w: number) {
    const cmd: PhysicsCommand = this.createEmptyMessage(id, PhysicsCommandType.quaternion);
    cmd.quaternionX = x;
    cmd.quaternionY = y;
    cmd.quaternionZ = z;
    cmd.quaternionW = w;
    this.sendMessage(cmd);
  }
  setVelocity(id: number, x: number, y: number, z: number) {
    const cmd: PhysicsCommand = this.createEmptyMessage(id, PhysicsCommandType.velocity);
    cmd.velX = x;
    cmd.velY = y;
    cmd.velZ = z;
    this.sendMessage(cmd);
  }
  setAngularVelocity(id: number, x: number, y: number, z: number) {
    const cmd: PhysicsCommand = this.createEmptyMessage(id, PhysicsCommandType.angularVelocity);
    cmd.angularX = x;
    cmd.angularY = y;
    cmd.angularZ = z;
    this.sendMessage(cmd);
  }
  addObject(id: number, geo: THREE.BufferGeometry, x: number, y: number, z: number, mass: number, cGroup?: CollisionGroups, cMask?: CollisionGroups, onDelete?: number) {
    const cmd: PhysicsCommand = this.createEmptyMessage(id, PhysicsCommandType.create);
    cmd.geo = geo.getAttribute('position').array;
    cmd.mass = mass;
    cmd.colGroup = cGroup;
    cmd.colMask = cMask;
    cmd.behavior = onDelete;
    cmd.positionX = x;
    cmd.positionY = y;
    cmd.positionZ = z;
    this.sendMessage(cmd);
  }
  addMesh(mesh: THREE.Mesh, mass: number, cGroup?: CollisionGroups, cMask?: CollisionGroups, onDelete?: number) {
    console.log('adding: ', mesh.name, mesh.id);
    const geo = mesh.geometry.clone();
    const buffGeo = geo instanceof THREE.BufferGeometry ? geo : new THREE.BufferGeometry().fromGeometry(geo);
    this.addObject(mesh.id, buffGeo, mesh.position.x, mesh.position.y, mesh.position.z, mass, cGroup, cMask, onDelete);
  }
  removePhysics(id: number) {
    const cmd: PhysicsCommand = this.createEmptyMessage(id, PhysicsCommandType.remove);
  }
  private createEmptyMessage(id: number, subType: PhysicsCommandType): PhysicsCommand {
    return {
      subType: subType,
      objectID: id,
      kinematic: undefined,
      geo: [],
      mass: undefined,
      colGroup: undefined,
      colMask: undefined,
      behavior: undefined,
      positionX: undefined,
      positionY: undefined,
      positionZ: undefined,
      quaternionX: undefined,
      quaternionY: undefined,
      quaternionZ: undefined,
      quaternionW: undefined,
      velX: undefined,
      velY: undefined,
      velZ: undefined,
      angularX: undefined,
      angularY: undefined,
      angularZ: undefined,
    };
  }
  private sendMessage(cmd: PhysicsCommand) {
    this.colyseus.getActiveRoom().subscribe( room => {
      if (cmd !== undefined) {
        room.send({type: 'PHYSICS_COMMAND', content: cmd});
      }
    });
  }
}
