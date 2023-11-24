import { Object3D, Vector3 } from 'three';
import {
  MessageType,
  PhysicsCommandAngular,
  PhysicsCommandKinematic,
  PhysicsCommandPosition,
  PhysicsCommandType,
  PhysicsCommandVelocity,
  PhysicsCommandWakeAll,
  PhysicsEntity,
  PhysicsEntityVariation,
} from '../../../../model/WsData';
import { ObjectUserData } from '../viewport.component';
import { PhysicsObjectState } from '../../../../model/state/PhysicsState';
import { Player } from '../../../../model/state/Player';
import { BoardItemControlService } from '../../../../services/board-item-control.service';
import { take } from 'rxjs/operators';
import { Observable, Observer, Subscription } from 'rxjs';
import { Progress } from '../../../../services/object-loader/loaderTypes';
import { MapSchema } from '@colyseus/schema';

export enum ClickRole {
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

  addInteractable: (obj: Object3D) => void;
  addPlayer: (mesh: Object3D, name: string) => void;

  // subscriptions
  private objectsMoved$$: Subscription;

  constructor(private bic: BoardItemControlService) {
    this.objectsMoved$$ = this.bic.gameState.observableState.physicsState.objectsMoved$.subscribe((item: PhysicsObjectState) => {
      this._updateOrGenerateItem(item);
    });
  }

  public onDestroy() {
    this.objectsMoved$$.unsubscribe();
  }

  /**
   * Searches the Object3D tree recursively to try to find the Object3D corresponding
   * @param toSearch object tree that is searched
   * @param physId physicsId that is searched for recursively
   */
  static getObjectByPhysId(toSearch: Object3D, physId: number): Object3D {
    if (toSearch?.userData && toSearch.userData.physicsId === physId) {
      return toSearch;
    } else {
      return toSearch?.children?.find((obj: Object3D) => {
        const res = PhysicsCommands.getObjectByPhysId(obj, physId);
        return res !== undefined;
      });
    }
  }

  static getPhysId(obj: Object3D): number {
    return obj.userData.physicsId;
  }

  initializeFromPhysicsState(): Observable<Progress> {
    return new Observable<Progress>((observer: Observer<Progress>) => {
      this.bic.gameState.observableState.physicsState.objects$.pipe(take(1)).subscribe((physicsObjects: MapSchema<PhysicsObjectState>) => {
        let count = 0;
        observer.next([count, physicsObjects.size]);
        physicsObjects.forEach((item: PhysicsObjectState) => {
          this._updateOrGenerateItem(item);
          count++;
          observer.next([count, physicsObjects.size]);
        });
        observer.complete();
      });
    });
  }

  private _updateOrGenerateItem(item: PhysicsObjectState): void {
    if (!item.disabled) {
      let obj: Object3D;
      this.bic.sceneTree.traverse((o) => {
        if (o.userData.physicsId === item.objectIDPhysics) {
          obj = o;
        }
      });
      //console.log(item.objectIDPhysics, item.disabled, item.position, obj)
      if (obj !== undefined) {
        this._updateCorrelatedObject(item, obj);
      } else {
        if (item.entity >= 0 && this.bic.sceneTree === undefined) {
          /* sceneTree is not yet initialized, this happens if ngAfterView
           * for viewport hasnt been done yet. This happens when early state
           * changes prompt changes in the scene, but it is not yet initialized
           * completly.
           * Therefore, nothing is done here. The entity is probably gonna be
           * initialized from normal loading or on a state update in the future.
           */
        } else if (item.entity >= 0 && this.bic.sceneTree.children.length < this.MAX_ALLOWED_OBJECTS) {
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

  private _updateCorrelatedObject(item: PhysicsObjectState, obj: Object3D) {
    obj.position.set(item.position.x, item.position.y, item.position.z);
    obj.quaternion.set(item.quaternion.x, item.quaternion.y, item.quaternion.z, item.quaternion.w);
    // update nametag sprite if needed
    if (item.entity === PhysicsEntity.figure) {
      const labelSprite = obj.children.find((val: Object3D) => {
        return val.type === 'Sprite';
      });
      if (labelSprite) {
        const worldPos = obj.getWorldPosition(new Vector3());
        const newPos = obj.worldToLocal(worldPos.add(new Vector3(0, 5, 0)));
        labelSprite.position.copy(newPos);
      }
    }
  }

  setClickRole(clickRole: ClickRole, obj: Object3D): void {
    if (obj !== undefined) {
      obj.userData.clickRole = clickRole;
      this.addInteractable(obj);
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

  setPositionVec(physId: number, vec: Vector3): void {
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

    this.bic.loader.getNewObject(entity).subscribe((model: Object3D) => {
      model.quaternion.set(rotX, rotY, rotZ, rotW);
      model.position.set(posX, posY, posZ);
      model.traverse((o) => (o.userData = {}));
      const userData: ObjectUserData = {
        physicsId: physicsId,
        entityType: entity,
        variation: 0,
        clickRole: 0,
      };
      model.userData = userData;
      this.bic.sceneTree.add(model);

      // set the various references in other classes
      switch (entity) {
        case PhysicsEntity.dice:
          this.setClickRole(ClickRole.dice, model);
          this.dice = model;
          break;
        case PhysicsEntity.figure:
          this.setClickRole(ClickRole.figure, model);

          // Load other playermodels
          this.bic.gameState
            .findInPlayerListOnce$((p: Player) => {
              return p.figureId === physicsId;
            })
            .subscribe((player: Player | undefined) => {
              if (player !== undefined) {
                this.bic.loader.switchTex(model, player.figureModel);
                this.addPlayer(model, player.displayName);
                model.userData.displayName = player.displayName;
              }
            });
          break;
      }
      console.log('Bound: ', entity, variant, physicsId, ' To: ', model.userData);
      this.currentlyLoadingEntities.set(physicsId, false);
    });
  }
}
