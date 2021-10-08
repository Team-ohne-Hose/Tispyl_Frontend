import * as THREE from 'three';
import { Object3D } from 'three';
import {
  MessageType,
  PhysicsCommandAngular,
  PhysicsCommandKinematic,
  PhysicsCommandPosition,
  PhysicsCommandRemove,
  PhysicsCommandType,
  PhysicsCommandVelocity,
  PhysicsCommandWakeAll,
  PhysicsEntity,
  PhysicsEntityVariation,
} from '../../../../model/WsData';
import { ObjectUserData } from '../viewport.component';
import { PhysicsObjectState, PhysicsState } from '../../../../model/state/PhysicsState';
import { Player } from '../../../../model/state/Player';
import { BoardItemControlService } from '../../../../services/board-item-control.service';
import { map, take } from 'rxjs/operators';
import { Observable, Observer } from 'rxjs';
import { Progress } from '../../../../services/object-loader/loaderTypes';

export enum ClickedTarget {
  other,
  board,
  dice,
  figure,
}

export enum CollisionGroups {
  All = 15,
  Other = 1,
  Plane = 2,
  Figures = 4,
  Dice = 8,
}

export class PhysicsCommands {
  private readonly MAX_ALLOWED_OBJECTS = 200;

  dice: Object3D;
  currentlyLoadingEntities: Map<number, boolean> = new Map<number, boolean>();

  addInteractable: (obj: THREE.Object3D) => void;
  addPlayer: (mesh: THREE.Object3D, name: string) => void;

  constructor(private bic: BoardItemControlService) {
    this.bic.gameState.physicsObjectMoved$.subscribe((item: PhysicsObjectState) => {
      this._updateOrGenerateItem(item);
    });
  }

  /**
   * Searches the Object3D tree recursively to try to find the Object3D corresponding
   * @param toSearch object tree that is searched
   * @param physId physicsId that is searched for recursively
   */
  static getObjectByPhysId(toSearch: Object3D, physId: number): THREE.Object3D {
    if (toSearch.userData.physicsId === physId) {
      return toSearch;
    } else {
      return toSearch.children.find((obj: THREE.Object3D, index: number) => {
        const res = PhysicsCommands.getObjectByPhysId(obj, physId);
        return res !== undefined;
      });
    }
  }

  static getPhysId(obj: Object3D): number {
    return obj.userData.physicsId;
  }

  getInitializePending(): number {
    const physState: PhysicsState = this.bic.gameState.getPhysicsState();
    if (physState !== undefined && physState.objects !== undefined) {
      return physState.objects.size;
    }
    return 0;
  }

  initializeFromState(): Observable<Progress> {
    return new Observable<Progress>((observer: Observer<Progress>) => {
      this.bic.gameState.physicState$
        .pipe(
          take(1),
          map((state: PhysicsState) => {
            let count = 0;
            if (state !== undefined) {
              observer.next([count, state.objects.size]);
              state.objects.forEach((item: PhysicsObjectState) => {
                this._updateOrGenerateItem(item);
                count++;
                observer.next([count, state.objects.size]);
              });
            } else {
              console.error(
                'PhysicsState is not accessible in initialization. Ensure loading initialization is done after Room data is available.'
              );
            }
          })
        )
        .subscribe(() => {
          observer.complete();
        });
    });
  }

  private _updateOrGenerateItem(item: PhysicsObjectState): void {
    if (!item.disabled) {
      const obj = PhysicsCommands.getObjectByPhysId(this.bic.sceneTree, item.objectIDPhysics);
      if (obj !== undefined) {
        this._updateCorrelatedObject(item, obj);
      } else {
        if (item.entity >= 0 && this.bic.sceneTree.children.length < this.MAX_ALLOWED_OBJECTS) {
          if (!this.currentlyLoadingEntities.get(item.objectIDPhysics)) {
            this.currentlyLoadingEntities.set(item.objectIDPhysics, true);
            this._generateEntityFromItem(item);
          }
        } else {
          console.error('cannot find/generate object', item.objectIDPhysics, item);
        }
      }
    }
  }

  private _updateCorrelatedObject(item: PhysicsObjectState, obj: THREE.Object3D) {
    obj.position.set(item.position.x, item.position.y, item.position.z);
    obj.quaternion.set(item.quaternion.x, item.quaternion.y, item.quaternion.z, item.quaternion.w);
  }

  setClickRole(clickRole: ClickedTarget, obj: THREE.Object3D): void {
    if (obj !== undefined) {
      obj.userData.clickRole = clickRole;
      this.addInteractable(obj);
      obj.children.forEach((value) => this.setClickRole(clickRole, value));
    }
  }

  setKinematic(physId: number, enabled: boolean): void {
    const msg: PhysicsCommandKinematic = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.kinematic,
      objectID: physId,
      kinematic: enabled,
    };
    this.bic.gameState.sendMessage(MessageType.PHYSICS_MESSAGE, msg);
  }

  setPositionVec(physId: number, vec: THREE.Vector3): void {
    this.setPosition(physId, vec.x, vec.y, vec.z);
  }

  setPosition(physId: number, x: number, y: number, z: number): void {
    const msg: PhysicsCommandPosition = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.position,
      objectID: physId,
      positionX: x,
      positionY: y,
      positionZ: z,
    };
    this.bic.gameState.sendMessage(MessageType.PHYSICS_MESSAGE, msg);
  }

  setVelocity(physId: number, x: number, y: number, z: number): void {
    const msg: PhysicsCommandVelocity = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.velocity,
      objectID: physId,
      velX: x,
      velY: y,
      velZ: z,
    };
    this.bic.gameState.sendMessage(MessageType.PHYSICS_MESSAGE, msg);
  }

  setAngularVelocity(physId: number, x: number, y: number, z: number): void {
    const msg: PhysicsCommandAngular = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.angularVelocity,
      objectID: physId,
      angularX: x,
      angularY: y,
      angularZ: z,
    };
    this.bic.gameState.sendMessage(MessageType.PHYSICS_MESSAGE, msg);
  }

  wakeAll(): void {
    const msg: PhysicsCommandWakeAll = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.wakeAll,
    };
    this.bic.gameState.sendMessage(MessageType.PHYSICS_MESSAGE, msg);
  }

  removePhysics(physId: number): void {
    const cmd: PhysicsCommandRemove = {
      type: MessageType.PHYSICS_MESSAGE,
      subType: PhysicsCommandType.remove,
      objectID: physId,
    };
  }

  private _generateEntityFromItem(item: PhysicsObjectState): void {
    this._generateEntity(
      item.entity,
      item.variant,
      item.objectIDPhysics,
      item.position.x,
      item.position.y,
      item.position.z,
      item.quaternion.x,
      item.quaternion.y,
      item.quaternion.z
    );
  }

  private _generateEntity(
    entity: PhysicsEntity,
    variant: PhysicsEntityVariation,
    physicsId: number,
    posX?: number,
    posY?: number,
    posZ?: number,
    rotX?: number,
    rotY?: number,
    rotZ?: number,
    rotW?: number
  ): void {
    posX = posX || 0;
    posY = posY || 0;
    posZ = posZ || 0;
    rotX = rotX || 0;
    rotY = rotY || 0;
    rotZ = rotZ || 0;
    rotW = rotW || 0;
    this.bic.loader.loadObject(entity, variant, (model: THREE.Object3D) => {
      model.quaternion.set(rotX, rotY, rotZ, rotW);
      model.position.set(posX, posY, posZ);
      const userData: ObjectUserData = {
        physicsId: physicsId,
        entityType: entity,
        variation: variant,
        clickRole: undefined,
      };
      model.userData = userData;
      console.debug('Adding physics object', model.userData.physicsId, model.name, entity, variant);
      this.bic.sceneTree.add(model);

      let player: Player;
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
          player = this.bic.gameState.findInPlayerList((p: Player) => {
            return p.figureId === physicsId;
          });
          if (player !== undefined) {
            this.bic.loader.switchTex(model, player.figureModel);
            this.addPlayer(model, player.displayName);
            model.userData.displayName = player.displayName;
          }
          break;
      }
      this.currentlyLoadingEntities.set(physicsId, false);
    });
  }
}
