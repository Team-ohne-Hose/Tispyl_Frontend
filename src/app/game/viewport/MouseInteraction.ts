import * as THREE from 'three';
import {BoardItemManagment} from './BoardItemManagment';
import {Camera, Mesh, Scene, Vector3} from 'three';
import {BoardCoordConversion} from './BoardCoordConversion';
import {Board, Tile} from '../../model/Board';
import {PhysicsEngine, PhysicsObject} from './PhysicsEngine';


export class MouseInteraction {

  // Raycasting & Mouse
  lastMouseLeftDownCoords: {x: number, y: number, button: number, ts: number};
  raycaster = new THREE.Raycaster();
  currentSize = new THREE.Vector2();

  boardItemManager: BoardItemManagment;
  camera: Camera;
  scene: Scene;

  currentlySelected: {obj: PhysicsObject, oldPos: Vector3};

  constructor(scene: Scene, camera: Camera, boardItemManager: BoardItemManagment, private physics: PhysicsEngine) {
    this.boardItemManager = boardItemManager;
    this.camera = camera;
    this.scene = scene;
  }

  updateScreenSize(width: number, height: number) {
    this.currentSize.width = width;
    this.currentSize.height = height;
  }
  mouseMoved(event) {
    if (this.currentlySelected !== undefined) {
      const normX = (event.clientX / this.currentSize.width) * 2 - 1;
      const normY = - (event.clientY / this.currentSize.height) * 2 + 1;
      this.raycaster.setFromCamera({x: normX, y: normY}, this.camera);
      const intersects = this.raycaster.intersectObject(this.boardItemManager.board);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        this.currentlySelected.obj.mesh.position.copy(point.setY(10));
      }
    }
  }
  mouseDown(event) {
    if (event.button === 0) {
      this.lastMouseLeftDownCoords = {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        ts: event.timeStamp,
      };
    }
  }
  mouseUp(event) {
    if (event.button === 0 && this.lastMouseLeftDownCoords.ts !== 0) {
      const travelled = {
        x: event.clientX - this.lastMouseLeftDownCoords.x,
        y: event.clientY - this.lastMouseLeftDownCoords.y,
        time: event.timeStamp - this.lastMouseLeftDownCoords.ts,
        distance: 0
      };
      travelled.distance = Math.sqrt((travelled.x * travelled.x) + (travelled.y * travelled.y));

      if (travelled.distance < 10) {
        // console.log('mouseClickRecognised: ', travelled.x, travelled.y, travelled.distance);
        this.clickToCoords(this.lastMouseLeftDownCoords.x, this.lastMouseLeftDownCoords.y);
      } else {
        console.log('dragDropRecognised: ', travelled.x, travelled.y, travelled.distance);
      }
      this.lastMouseLeftDownCoords = {
        x: 0,
        y: 0,
        button: event.button,
        ts: 0,
      };
    }
  }
  clickToCoords(x: number, y: number) {
    const normX = (x / this.currentSize.width) * 2 - 1;
    const normY = - (y / this.currentSize.height) * 2 + 1;
    // console.log('clicking on: ', normX, normY);
    this.raycaster.setFromCamera({x: normX, y: normY}, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      // console.log('Intersecting:', intersects[0].object.name);
      if (intersects[0].object.name === 'gameboard') {
        if (!this.handleBoardTileClick(point)) {
          // this.boardItemManager.addMarker(point.x, point.y, point.z, 0x0000ff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
          this.boardItemManager.addFlummi(point.x + (Math.random() - 0.5), 30, point.z + (Math.random() - 0.5), Math.random() * 0xffffff);
        }
        this.currentlySelected = undefined;
      } else if (intersects[0].object.name === 'gamefigure') {
        const pObj = this.physics.getObjectFromMesh(intersects[0].object as Mesh);
        if (pObj !== undefined) {
          pObj.physicsEnabled = false;
          this.currentlySelected = {obj: pObj, oldPos: pObj.mesh.position.clone()};
        }
        console.log('selected Object');
      } else if (intersects[0].object.name === 'Cube' ||
        intersects[0].object.name === 'Cube_0' ||
        intersects[0].object.name === 'Cube_1') {
        this.boardItemManager.throwDice();
      } else {
      }


    }

    /*const inters = this.raycaster.intersectObject(this.boardItemManager.board);
    if (inters.length > 0) {
      const point = inters[0].point;
      this.boardItemManager.addMarker(point.x, point.y, point.z, 0x0000ff);
      this.handleBoardTileClick(point);
    }*/
  }
  handleBoardTileClick(intersection: THREE.Vector3): boolean {
    const coords = BoardCoordConversion.coordsToFieldCoords(intersection);
    if (coords.x >= 0 && coords.x < 8 && coords.y >= 0 && coords.y < 8) {
      const tileId = Board.getId(coords.x, coords.y);
      const tile = Board.getTile(tileId);
      console.log('clicked on Tile: ', tile.translationKey, coords.x, coords.y);
      if (this.currentlySelected !== undefined) {
        this.boardItemManager.moveGameFigure(this.currentlySelected.obj.mesh, tileId);
        this.currentlySelected.obj.physicsEnabled = true;
        return true;
      }
    } else {
      console.log('clicked outside of playing field');
      this.currentlySelected.obj.mesh.position.copy(this.currentlySelected.oldPos);
      this.currentlySelected.obj.physicsEnabled = true;
    }
    return false;
  }
}
