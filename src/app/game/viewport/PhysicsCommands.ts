import * as THREE from 'three';
import {Object3D} from 'three';
import {
  MessageType,
  PhysicsCommand,
  PhysicsCommandAngular,
  PhysicsCommandKinematic,
  PhysicsCommandPosition,
  PhysicsCommandQuat,
  PhysicsCommandRemove,
  PhysicsCommandType,
  PhysicsCommandVelocity,
  PhysicsEntity,
  PhysicsEntityVariation,
} from '../../model/WsData';
import {ObjectUserData} from './viewport.component';
import {ObjectLoaderService} from '../../services/object-loader.service';
import {PhysicsObjectState, PhysicsState} from '../../model/state/PhysicsState';
import {Player} from '../../model/state/Player';
import {GameStateService} from '../../services/game-state.service';
import {ColyseusNotifyable} from '../../services/game-initialisation.service';
import {NodeLib} from 'three/examples/jsm/nodes/core/NodeLib';
import add = NodeLib.add;

export enum ClickedTarget {
  other,
  board,
  dice,
  figure
}
export enum CollisionGroups {
  All = 15,
  Other = 1,
  Plane = 2,
  Figures = 4,
  Dice = 8
}
export class PhysicsCommands implements ColyseusNotifyable {
  scene: THREE.Scene;

  dice: Object3D;
  currentlyLoadingEntities: Map<number, boolean> = new Map<number, boolean>();

  addInteractable: ((obj: THREE.Object3D) => void);
  addPlayer: (mesh: THREE.Object3D, name: string) => void;
  isPlayerCached: (physId: number) => boolean;

  constructor(private loader: ObjectLoaderService,
              private gameState: GameStateService) {}

  static getObjectByPhysId(toSearch: Object3D, physId: number): THREE.Object3D {
    if (toSearch.name !== undefined) {
    // console.log('searching for ' + physId + ' in: ', toSearch.name, toSearch.userData.physicsId, toSearch.userData.physicsId === physId);
    }
    if (toSearch.userData.physicsId === physId) {
      // console.warn('found', toSearch);
      return toSearch;
    } else {
      const result: Object3D = toSearch.children.find((obj: THREE.Object3D, index: number) => {
        const res = PhysicsCommands.getObjectByPhysId(obj, physId);
        if (res !== undefined) {
          // console.warn('found', res);
          return true;
        }
        return false;
      });
      return result;
    }
  }
  static getPhysId(obj: Object3D): number {
    return obj.userData.physicsId;
  }

  attachColyseusStateCallbacks(gameState: GameStateService): void {
    gameState.addPhysicsCallback((item: PhysicsObjectState) => {
      this.updateFromState(item, () => {});
    });
    gameState.addPhysicsObjectMovedCallback((item: PhysicsObjectState, key: string) => {
      console.log('new pos patch');
      this.updateFromState(item, () => {});
    });
  }
  attachColyseusMessageCallbacks(gameState: GameStateService): void {}

  getInitializePending(): number {
    const gameState = this.gameState.getState();
    if (gameState !== undefined) {
      const physState = gameState.physicsState;
      if (physState !== undefined) {
        return physState.objects.size;
      }
    }
  }
  initializeFromState(progressCallback: () => void): void {
    const gameState = this.gameState.getState();
    if (gameState !== undefined) {
      const physState = gameState.physicsState;
      if (physState !== undefined) {
        physState.objects.forEach((item: PhysicsObjectState, key: string) => {
          if (item !== undefined) {
            this.updateFromState(item, progressCallback);
          } else {
            console.warn('initializing from State: Object in PhysicsList was undefined');
            progressCallback();
          }
        });
      } else {
        console.error('PhysicsState is not accessible');
      }
    } else {
      console.error('GameState is not accessible');
    }
  }
  updateFromState(item: PhysicsObjectState, onDone: () => void): void {
    if (!item.disabled) {
      const obj = PhysicsCommands.getObjectByPhysId(this.scene, item.objectIDPhysics);
      // console.log('query for physId', item.objectIDPhysics, obj);
      if (obj !== undefined) {
        obj.position.set(item.position.x, item.position.y, item.position.z);
        obj.quaternion.set(item.quaternion.x, item.quaternion.y, item.quaternion.z, item.quaternion.w);
        // console.log('new Position: ', key, item.position.x, item.position.y, item.position.z, item.position);
        // console.log("rotation is: ", item.quaternion.x, item.quaternion.y, item.quaternion.z, item.quaternion.w);
        onDone();
      } else {
        if (item.entity >= 0 && this.scene.children.length < 120) { // TODO balance
          if (this.currentlyLoadingEntities.get(item.objectIDPhysics)) {
            // is currently getting loaded
            onDone();
          } else {
            // console.log('adding via State', item.objectIDPhysics);
            this.currentlyLoadingEntities.set(item.objectIDPhysics, true);
            this.generateEntity(onDone, item.entity, item.variant, item.objectIDPhysics,
              item.position.x, item.position.y, item.position.z, item.quaternion.x, item.quaternion.y, item.quaternion.z);
          }
        } else {
          console.error('cannot find/generate object', item.objectIDPhysics, item);
          onDone();
        }
      }
    } else {
      onDone();
    }
  }

  private generateEntity(onDone: () => void, entity: PhysicsEntity, variant: PhysicsEntityVariation, physicsId: number,
                         posX?: number, posY?: number, posZ?: number, rotX?: number, rotY?: number, rotZ?: number, rotW?: number) {

    if (entity === PhysicsEntity.figure && this.isPlayerCached(physicsId)) {
      // if playerfigure was already cached dont load it
      onDone();
      return;
    }
    posX = posX || 0;
    posY = posY || 0;
    posZ = posZ || 0;
    rotX = rotX || 0;
    rotY = rotY || 0;
    rotZ = rotZ || 0;
    rotW = rotW || 0;
    this.loader.loadObject(entity, variant, (model: THREE.Object3D) => {

      model.quaternion.set(rotX, rotY, rotZ, rotW);
      model.position.set(posX, posY, posZ);
      const userData: ObjectUserData = {physicsId: physicsId, entityType: entity, variation: variant, clickRole: undefined};
      model.userData = userData;
      console.debug('Adding physics object', model.userData.physicsId, model.name, entity, variant);
      this.scene.add(model);
      // set the various references in other classes
      switch (entity) {
        case PhysicsEntity.dice:
          this.setClickRole(ClickedTarget.dice, model);
          this.dice = model;
          // console.log('set dice');
          break;
        case PhysicsEntity.figure:
          this.setClickRole(ClickedTarget.figure, model);

          // Load other playermodels
          const room = this.gameState.getRoom();
          if (room !== undefined) {
            room.state.playerList.forEach((player: Player, key: string) => {
              if (player.figureId === physicsId) {
                this.loader.switchTex(model, player.figureModel);
                this.addPlayer(model, player.displayName);
                model.userData.displayName = player.displayName;
              }
            });
          }
          break;
      }
      this.currentlyLoadingEntities.set(physicsId, false);
      onDone();
    });
  }
  setClickRole(clickRole: ClickedTarget, obj: THREE.Object3D) {
    if (obj !== undefined) {
      obj.userData.clickRole = clickRole;
      this.addInteractable(obj);
      obj.children.forEach((value => this.setClickRole(clickRole, value)));
    }
  }
  setKinematic(physId: number, enabled: boolean) {
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
  /*setRotationQuat(physId, quat: THREE.Quaternion) {
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
  }*/
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
  removePhysics(physId: number) {
    const cmd: PhysicsCommandRemove = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.remove,
      objectID: physId,
    };
  }
  private sendMessage(msg: PhysicsCommand) {
    const room = this.gameState.getRoom();
    if (msg !== undefined && room !== undefined) {
      room.send(msg.type, msg);
    }
  }
}
