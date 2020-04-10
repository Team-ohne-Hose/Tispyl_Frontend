import { Injectable } from '@angular/core';
import {Camera, Vector3} from 'three';
import {DeprecatedCommand} from '@angular/cli/commands/deprecated-impl';
import {Board} from './model/Board';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  viewCamera: Camera;
  centerCoordsModel = {
    x: [-23.4, -14.819, -6.238, 2.343, 10.923, 19.504, 28.085, 36.666],
    y: [-35.119, -25.198, -15.277, -5.357, 4.563, 14.484, 24.405, 34.325]
  };
  borderCoordsModel = {
    x: [-27.69, -19.109, -10.529, -1.948, 6.633, 15.214, 23.794, 32.375, 40.956],
    y: [-40.079, -30.159, -20.238, -10.317, -0.397, 9.524, 19.444, 29.365, 39.286]
  };
  centerCoords = {
    x: [-25.725, -16.664, -7.259, 1.793, 11.009, 20.208, 29.398, 38.708],
    y: [-36.776, -26.210, -15.565, -4.940, 5.853, 16.498, 27.153, 37.331]
  };
  borderCoords = {
    x: [-29.973, -21.478, -11.850, -2.669, 6.244, 15.763, 24.652, 34.143, 43.273],
    y: [-42.004, -31.548, -20.873, -10.258, 0.377, 11.329, 21.667, 32.639, 42.024]
  };
  constructor( camera: Camera) {
    this.viewCamera = camera;
  }

  zoomToField(fieldId: number) {
    console.log('Zooming to Field: ', fieldId);
  }
  getFieldCenter(fieldId: number): {x: number, y: number} {
    const coords: {x: number, y: number} = Board.getCoords(fieldId);
    return {
      x: this.centerCoords.x[coords.x],
      y: this.centerCoords.y[coords.y]
    };
  }
  getFieldCoords(fieldId: number): {x1: number, y1: number, x2: number, y2: number} {
    const coords: {x: number, y: number} = Board.getCoords(fieldId);
    return {
      x1: this.borderCoords.x[coords.x],
      y1: this.borderCoords.y[coords.y],
      x2: this.borderCoords.x[coords.x + 1],
      y2: this.borderCoords.y[coords.y + 1]
    };
  }

  getCurrentPosition(): Vector3  {
    return this.viewCamera.position;
  }
}
