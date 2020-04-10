import {Board} from '../model/Board';


export class BoardCoordConversion {
  constructor() {}
  static centerCoords = {
    x: [-25.725, -16.664, -7.259, 1.793, 11.009, 20.208, 29.398, 38.708],
    y: [-36.776, -26.210, -15.565, -4.940, 5.853, 16.498, 27.153, 37.331]
  };
  static borderCoords = {
    x: [-29.973, -21.478, -11.850, -2.669, 6.244, 15.763, 24.652, 34.143, 43.273],
    y: [-42.004, -31.548, -20.873, -10.258, 0.377, 11.329, 21.667, 32.639, 42.024]
  };

  static getFieldCenter(fieldId: number): {x: number, y: number} {
    const coords: {x: number, y: number} = Board.getCoords(fieldId);
    return {
      x: this.centerCoords.x[coords.x],
      y: this.centerCoords.y[coords.y]
    };
  }
  static getFieldCoords(fieldId: number): {x1: number, y1: number, x2: number, y2: number} {
    const coords: {x: number, y: number} = Board.getCoords(fieldId);
    return {
      x1: this.borderCoords.x[coords.x],
      y1: this.borderCoords.y[coords.y],
      x2: this.borderCoords.x[coords.x + 1],
      y2: this.borderCoords.y[coords.y + 1]
    };
  }

  static coordsToFieldCoords(coords: THREE.Vector3): {x: number, y: number} {
    let x = -1, y = -1;
    for (let i = 0; i < 9; i++) {
      if (coords.x >= this.borderCoords.x[i]) {
        x = i;
      }
      if (coords.z >= this.borderCoords.y[i]) {
        y = i;
      }
    }
    return {x: x, y: y};
  }
}
