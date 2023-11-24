import { Camera, Intersection, Object3D, Raycaster, Vector2, Vector3 } from 'three';
import { ClickRole } from './PhysicsCommands';
import { BoardItemControlService } from '../../../../services/board-item-control.service';
import { Player } from '../../../../model/state/Player';
import { itemTargetErrorType } from '../../../../services/items-service/item.service';
import { take } from 'rxjs';

/** See: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button */
enum mouseButton {
  MAIN,
  AUXILIARY,
  SECONDARY,
  FOURTH,
  FIFTH,
}

interface MouseTravelInfo {
  x: number;
  y: number;
  x_last: number;
  y_last: number;
  x_delta: number;
  y_delta: number;
  time_delta: number;
  distance: number;
}

export class MouseInteraction {
  /** Internals */
  private camera: Camera;
  private screenSize: Vector2 = new Vector2(0, 0);
  private raycaster: Raycaster = new Raycaster();

  /** State */
  private readonly noopMouseDown = { x: 0, y: 0, button: 0, ts: 0 };
  private lastMouseDown: { x: number; y: number; button: number; ts: number };

  interactable: Object3D[] = [];
  hoveringFigure: { obj: Object3D; oldPos: Vector3 };

  constructor(private bic: BoardItemControlService) {
    this.camera = bic.camera;
    this.bic.physics.addInteractable = this.addInteractable.bind(this);
  }

  public onMouseDown(event: MouseEvent): void {
    /** Left mouse down */
    if (event.button === mouseButton.MAIN) {
      this.lastMouseDown = {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        ts: event.timeStamp,
      };
    }
  }

  public onMouseUp(event: MouseEvent): void {
    /** Left mouse up */
    if (event.button === mouseButton.MAIN) {
      if (this.lastMouseDown.ts !== 0) {
        const travelled = this._toMouseTravelInfo(event);
        if (travelled.distance < 10) {
          this.onMouseClicked(travelled.x_last, travelled.y_last);
        } else {
          this.onMouseDragged(travelled);
        }
        this.lastMouseDown = { ...this.noopMouseDown };
      }
    }
    /** Right mouse up */
    if (event.button === mouseButton.SECONDARY) {
      if (this.bic.itemService.isTargeting()) {
        this.bic.itemService.abortTargeting({
          type: itemTargetErrorType.USER_ABORT,
          event: event,
          message: 'User aborted targeting by right clicking.',
        });
      }
    }
  }

  /** Throttled version of the mouseMove function to avoid too many ray casts */
  public onMouseMoved(event: MouseEvent): void {
    this.throttled(1, this._onMouseMoved.bind(this))(event);
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

  private _onMouseMoved(event: MouseEvent): void {
    if (this.hoveringFigure !== undefined) {
      const intersects = this._rayIntersections(
        event.clientX,
        event.clientY,
        this.interactable.filter((object: Object3D) => {
          return object.userData.clickRole === ClickRole.board;
        })
      );
      if (intersects.length > 0) {
        const point = intersects[0].point;
        // hover figure over board
        this.bic.hoverGameFigure(this.hoveringFigure.obj, point.x, point.z);
      }
    } else {
      const intersects = this._rayIntersectionsEv(event);
      if (this.bic.itemService.isTargeting() && intersects.length > 0 && this.getClickedType(intersects[0].object) === ClickRole.figure) {
        const obj = intersects[0].object;
        console.log(obj);
        this.bic.gameState
          .getMe$()
          .pipe(take(1))
          .subscribe((me: Player) => {
            const targetFigureId = me.figureId;
            if (targetFigureId !== obj.userData.physicsId) {
              this.bic.gameState
                .findInPlayerListOnce$((player: Player) => {
                  return player.figureId === obj.userData.physicsId;
                })
                .subscribe((targetPlayer: Player) => {
                  if (targetPlayer !== undefined) {
                    this.bic.itemService.onTargetHover(obj.userData.physicsId);
                  }
                });
            }
          });
      }
    }
  }

  addInteractable(obj: Object3D): void {
    // console.error('pushing obj', obj);
    this.interactable.push(obj);
  }

  updateScreenSize(width: number, height: number): void {
    this.screenSize.width = width;
    this.screenSize.height = height;
  }

  onMouseDragged(traveled: MouseTravelInfo): void {
    console.log('dragDropRecognised: ', traveled.distance, traveled.x, traveled.y);
    console.log('scene:', this.bic.sceneTree, this.interactable);
    this.bic.physics.wakeAll();
  }

  onMouseClicked(x: number, y: number): void {
    const intersects = this._rayIntersections(x, y, this.interactable);
    console.log(
      `click @(x:${x}, y:${y})`,
      intersects.map((i) => i.object)
    );
    if (intersects.length > 0) {
      this.onObjectClicked(intersects[0]);
    }
  }

  onObjectClicked(inter: Intersection): void {
    const obj: Object3D = this._first_interactable_ancester(inter.object);
    if (obj.userData.clickRole === ClickRole.figure) {
      if (this.hoveringFigure !== undefined) {
        this.handleBoardTileClick(inter.point);
        this.hoveringFigure = undefined;
      } else {
        this.bic.gameState
          .getMe$()
          .pipe(take(1))
          .subscribe((me: Player) => {
            const physId = obj.userData.physicsId;
            if (me.figureId === physId) {
              this.startFigureHover(obj, inter);
            } else if (this.bic.itemService.isTargeting()) {
              this.bic.gameState
                .findInPlayerListOnce$((p) => p.figureId === obj.userData.physicsId)
                .subscribe((targetPlayer: Player) => {
                  this.bic.itemService.onTargetFinish(targetPlayer);
                });
            }
          });
      }
    } else if (obj.userData.clickRole === ClickRole.board) {
      this.handleBoardTileClick(inter.point);
      this.hoveringFigure = undefined;
    } else if (obj.userData.clickRole === ClickRole.dice) {
      this.bic.throwDice();
    }
  }

  private startFigureHover(figure: Object3D, inter: Intersection) {
    this.hoveringFigure = { obj: figure, oldPos: figure.position.clone() };
    this.bic.physics.setKinematic(figure.userData.physicsId, true);
    this.bic.physics.wakeAll();
    this.bic.hoverGameFigure(this.hoveringFigure.obj, inter.point.x, inter.point.z);
  }

  /**
   * Finds itself or the first ancestor of an Object3D that has a clickRole in its user data.
   * @param obj The initial Object3D
   */
  private _first_interactable_ancester(obj: Object3D): Object3D {
    const keyName = 'clickRole';
    if (keyName in obj.userData) {
      return obj;
    } else {
      let tmp_obj: Object3D;
      obj.traverseAncestors((o) => {
        if (keyName in o.userData && tmp_obj === undefined) {
          tmp_obj = o;
        }
      });
      if (tmp_obj === undefined) {
        throw Error('Could not find interactable ancestor of Object3D');
      } else {
        return tmp_obj;
      }
    }
  }

  handleBoardTileClick(intersection: Vector3): boolean {
    const coords = this.bic.boardTiles.coordsToFieldCoords(intersection);
    if (coords.x >= 0 && coords.x < 8 && coords.y >= 0 && coords.y < 8) {
      const tileId = this.bic.boardTiles.getId(coords.x, coords.y);
      this.bic.boardTiles.getTile(tileId);
      if (this.hoveringFigure !== undefined) {
        //this.bic.moveGameFigure(this.hoveringFigure.obj, tileId); <--- why though?
        this.bic.physics.setKinematic(this.hoveringFigure.obj.userData.physicsId, false);
        return true;
      }
    } else {
      if (this.hoveringFigure !== undefined) {
        this.bic.physics.setKinematic(this.hoveringFigure.obj.userData.physicsId, false);
      }
    }
    return false;
  }

  private getClickedType(o: Object3D): ClickRole {
    if (o.name === 'gameboard') {
      return ClickRole.board;
    } else {
      return o.parent.userData ? o.parent.userData.clickRole || ClickRole.other : ClickRole.other;
    }
  }

  private _toMouseTravelInfo(event: MouseEvent): MouseTravelInfo {
    const mti: MouseTravelInfo = {
      x: event.clientX,
      y: event.clientY,
      x_last: this.lastMouseDown.x,
      y_last: this.lastMouseDown.y,
      x_delta: event.clientX - this.lastMouseDown.x,
      y_delta: event.clientY - this.lastMouseDown.y,
      time_delta: event.timeStamp - this.lastMouseDown.ts,
      distance: 0,
    };
    mti.distance = Math.sqrt(mti.x_delta * mti.x_delta + mti.y_delta * mti.y_delta);
    return mti;
  }

  private _rayIntersectionsEv(event: MouseEvent): Intersection[] {
    return this._rayIntersections(event.clientX, event.clientY, this.interactable);
  }

  private _rayIntersections(x: number, y: number, targetCollection: Object3D[]): Intersection[] {
    const normX = (x / this.screenSize.width) * 2 - 1;
    const normY = -(y / this.screenSize.height) * 2 + 1;
    this.raycaster.setFromCamera({ x: normX, y: normY }, this.camera);

    return this.raycaster.intersectObjects(targetCollection);
  }
}
