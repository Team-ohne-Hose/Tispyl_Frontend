import * as THREE from 'three';
import {ViewportComponent} from './viewport.component';


export class MouseInteraction {

  // Raycasting & Mouse
  lastMouseLeftDownCoords: {x: number, y: number, button: number, ts: number};
  raycaster = new THREE.Raycaster();
  currentSize = new THREE.Vector2();

  myView: ViewportComponent;

  constructor( view: ViewportComponent) {
    this.myView = view;
  }

  updateScreenSize(width: number, height: number) {
    this.currentSize.width = width;
    this.currentSize.height = height;
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
    this.raycaster.setFromCamera({x: normX, y: normY}, this.myView.camera);
    const intersects = this.raycaster.intersectObjects(this.myView.scene.children);

    const inters = this.raycaster.intersectObject(this.myView.gameBoard);
    if (inters.length > 0) {
      const point = inters[0].point;
      this.myView.boardItemManager.addMarker(point.x, point.y, point.z, 0x0000ff);
    }
  }
}
