import * as THREE from 'three';
import { Camera, Object3D, Vector3 } from 'three';
import { ClickedTarget, PhysicsCommands } from './PhysicsCommands';
import { BoardItemControlService } from '../../../../services/board-item-control.service';

export class MouseInteraction {
  // Raycasting & Mouse
  lastMouseLeftDownCoords: { x: number; y: number; button: number; ts: number };
  raycaster = new THREE.Raycaster();
  currentSize = new THREE.Vector2();

  camera: Camera;
  interactable: Object3D[] = [];

  currentlySelected: { obj: THREE.Object3D; oldPos: Vector3 };

  /** Throttled version of the mouseMove function to avoid too many ray casts */
  mouseMoved = this.throttled(15, this._mouseMoved.bind(this));

  constructor(private bic: BoardItemControlService) {
    this.camera = bic.camera;
    this.bic.physics.addInteractable = this.addInteractable.bind(this);
  }

  addInteractable(obj: Object3D): void {
    // console.error('pushing obj', obj);
    this.interactable.push(obj);
  }

  updateScreenSize(width: number, height: number): void {
    this.currentSize.width = width;
    this.currentSize.height = height;
  }

  /** This is used to avoid calling too many mouseMove events */
  private throttled(delay: number, fn: (...args) => void): (...args) => void {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      return fn(...args);
    };
  }

  private _mouseMoved(event: MouseEvent): void {
    if (this.currentlySelected !== undefined) {
      const normX = (event.clientX / this.currentSize.width) * 2 - 1;
      const normY = -(event.clientY / this.currentSize.height) * 2 + 1;
      this.raycaster.setFromCamera({ x: normX, y: normY }, this.camera);
      const intersects = this.raycaster.intersectObject(this.bic.board);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        this.bic.hoverGameFigure(this.currentlySelected.obj, point.x, point.z);
      }
    } else if (this.bic.itemService.isCurrentlyTargeting()) {
      const normX = (event.clientX / this.currentSize.width) * 2 - 1;
      const normY = -(event.clientY / this.currentSize.height) * 2 + 1;
      this.raycaster.setFromCamera({ x: normX, y: normY }, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactable);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const type = this.getClickedType(intersects[0].object);
        // console.log('Intersecting:', intersects[0].object.name, type);
        if (type === ClickedTarget.figure) {
          const obj = intersects[0].object;
          const targetFigureId = this.bic.gameState.getMyFigureId();
          if (targetFigureId !== obj.userData.physicsId) {
            this.bic.itemService.onTargetHover(obj.userData.physicsId);
          }
        }
      }
    }
  }

  mouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      this.lastMouseLeftDownCoords = {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        ts: event.timeStamp,
      };
    }
  }

  mouseUp(event: MouseEvent): void {
    if (event.button === 0 && this.lastMouseLeftDownCoords.ts !== 0) {
      const travelled = {
        x: event.clientX - this.lastMouseLeftDownCoords.x,
        y: event.clientY - this.lastMouseLeftDownCoords.y,
        time: event.timeStamp - this.lastMouseLeftDownCoords.ts,
        distance: 0,
      };
      travelled.distance = Math.sqrt(travelled.x * travelled.x + travelled.y * travelled.y);

      if (travelled.distance < 10) {
        this.clickCoords(this.lastMouseLeftDownCoords.x, this.lastMouseLeftDownCoords.y);
      } else {
        this.dragCoords(
          this.lastMouseLeftDownCoords.x,
          this.lastMouseLeftDownCoords.y,
          event.clientX,
          event.clientY,
          travelled.x,
          travelled.y,
          travelled.distance
        );
      }
      this.lastMouseLeftDownCoords = {
        x: 0,
        y: 0,
        button: event.button,
        ts: 0,
      };
    }
  }

  dragCoords(x: number, y: number, x2: number, y2: number, distX: number, distY: number, dist: number): void {
    console.log('dragDropRecognised: ', dist, x, y);
    console.error('scene:', this.bic.sceneTree, this.interactable);
  }

  clickCoords(x: number, y: number): void {
    const normX = (x / this.currentSize.width) * 2 - 1;
    const normY = -(y / this.currentSize.height) * 2 + 1;
    this.raycaster.setFromCamera({ x: normX, y: normY }, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactable);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const type = this.getClickedType(intersects[0].object);
      console.log('Intersecting:', intersects[0].object.name, type);
      if (type === ClickedTarget.board) {
        if (!this.handleBoardTileClick(point)) {
          this.bic.addFlummi(
            point.x + (Math.random() - 0.5),
            30,
            point.z + (Math.random() - 0.5),
            Math.random() * 0xffffff
          );
        }
        this.currentlySelected = undefined;
      } else if (type === ClickedTarget.figure) {
        const obj = intersects[0].object.parent;
        if (this.currentlySelected !== undefined) {
          console.log('clicked on other figure');
          this.handleBoardTileClick(point);
          this.currentlySelected = undefined;
        } else {
          if (this.bic.gameState.getMyFigureId() === obj.userData.physicsId) {
            this.currentlySelected = { obj: obj, oldPos: obj.position.clone() };
            this.bic.physics.setKinematic(PhysicsCommands.getPhysId(obj), true);
            this.bic.physics.wakeAll();
            this.bic.hoverGameFigure(this.currentlySelected.obj, point.x, point.z);
            console.log('selected Object');
          } else {
            if (this.bic.itemService.isCurrentlyTargeting()) {
              this.bic.itemService.onTargetSet(obj.userData.physicsId);
            } else {
              console.log('This is not your figure');
            }
          }
        }
      } else if (type === ClickedTarget.dice) {
        this.bic.throwDice();
      }
    }
  }

  handleBoardTileClick(intersection: THREE.Vector3): boolean {
    const coords = this.bic.boardTiles.coordsToFieldCoords(intersection);
    if (coords.x >= 0 && coords.x < 8 && coords.y >= 0 && coords.y < 8) {
      const tileId = this.bic.boardTiles.getId(coords.x, coords.y);
      const tile = this.bic.boardTiles.getTile(tileId);
      // console.log('clicked on Tile: ', tile.translationKey, coords.x, coords.y);
      if (this.currentlySelected !== undefined) {
        this.bic.moveGameFigure(this.currentlySelected.obj, tileId);
        this.bic.physics.setKinematic(PhysicsCommands.getPhysId(this.currentlySelected.obj), false);
        return true;
      }
    } else {
      // console.log('clicked outside of playing field');
      // const oldPos = this.currentlySelected.oldPos;
      // this.physics.setPosition(PhysicsCommands.getPhysId(this.currentlySelected.obj), oldPos.x, oldPos.y, oldPos.z);
      if (this.currentlySelected !== undefined) {
        this.bic.physics.setKinematic(PhysicsCommands.getPhysId(this.currentlySelected.obj), false);
      }
    }
    return false;
  }

  private getClickedType(o: Object3D): ClickedTarget {
    if (o.name === 'gameboard') {
      return ClickedTarget.board;
    } else {
      console.log('not gameboard', o);
      return o.parent.userData ? o.parent.userData.clickRole || ClickedTarget.other : ClickedTarget.other;
    }
  }
}
