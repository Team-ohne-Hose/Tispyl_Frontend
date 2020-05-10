import * as THREE from 'three';
import { Injectable } from '@angular/core';
import {ObjectLoaderService} from './object-loader.service';
import {ColyseusClientService} from './colyseus-client.service';
import {GameState} from '../model/state/GameState';
import {Room} from 'colyseus.js';
import {DataChange} from '@colyseus/schema';
import {BoardLayoutState, Tile} from '../model/state/BoardLayoutState';
import {Data} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BoardTilesService {

  constructor(private objectLoader: ObjectLoaderService, private colyseus: ColyseusClientService) { }

  centerCoords = {
    x: [-30, -20, -10, 0, 10, 20, 30, 40],
    y: [-35, -25, -15, -5, 5, 15, 25, 35]
  };
  borderCoords = {
    x: [-35, -25, -15, -5, 5, 15, 25, 35, 45],
    y: [-40, -30, -20, -10, 0, 10, 20, 30, 40]
  };
  /*
  centerCoords = {
    x: [-25.725, -16.664, -7.259, 1.793, 11.009, 20.208, 29.398, 38.708],
    y: [-36.776, -26.210, -15.565, -4.940, 5.853, 16.498, 27.153, 37.331]
  };
  borderCoords = {
    x: [-29.973, -21.478, -11.850, -2.669, 6.244, 15.763, 24.652, 34.143, 43.273],
    y: [-42.004, -31.548, -20.873, -10.258, 0.377, 11.329, 21.667, 32.639, 42.024]
  };*/
  private tileCoords = [
    {x: 7, y: 0, r: 2},
    {x: 6, y: 0, r: 2},
    {x: 5, y: 0, r: 2},
    {x: 4, y: 0, r: 2},
    {x: 3, y: 0, r: 2},
    {x: 2, y: 0, r: 2},
    {x: 1, y: 0, r: 2},
    {x: 0, y: 0, r: 2},
    {x: 0, y: 1, r: 3},
    {x: 0, y: 2, r: 3},
    {x: 0, y: 3, r: 3},
    {x: 0, y: 4, r: 3},
    {x: 0, y: 5, r: 3},
    {x: 0, y: 6, r: 3},
    {x: 0, y: 7, r: 0},
    {x: 1, y: 7, r: 0},
    {x: 2, y: 7, r: 0},
    {x: 3, y: 7, r: 0},
    {x: 4, y: 7, r: 0},
    {x: 5, y: 7, r: 0},
    {x: 6, y: 7, r: 0},
    {x: 7, y: 7, r: 0},
    {x: 7, y: 6, r: 1},
    {x: 7, y: 5, r: 1},
    {x: 7, y: 4, r: 1},
    {x: 7, y: 3, r: 1},
    {x: 7, y: 2, r: 1},
    {x: 7, y: 1, r: 1},
    {x: 6, y: 1, r: 2},
    {x: 5, y: 1, r: 2},
    {x: 4, y: 1, r: 2},
    {x: 3, y: 1, r: 2},
    {x: 2, y: 1, r: 2},
    {x: 1, y: 1, r: 3},
    {x: 1, y: 2, r: 3},
    {x: 1, y: 3, r: 3},
    {x: 1, y: 4, r: 3},
    {x: 1, y: 5, r: 3},
    {x: 1, y: 6, r: 3},
    {x: 2, y: 6, r: 0},
    {x: 3, y: 6, r: 0},
    {x: 4, y: 6, r: 0},
    {x: 5, y: 6, r: 0},
    {x: 6, y: 6, r: 1},
    {x: 6, y: 5, r: 1},
    {x: 6, y: 4, r: 1},
    {x: 6, y: 3, r: 1},
    {x: 6, y: 2, r: 1},
    {x: 5, y: 2, r: 2},
    {x: 4, y: 2, r: 2},
    {x: 3, y: 2, r: 2},
    {x: 2, y: 2, r: 2},
    {x: 2, y: 3, r: 3},
    {x: 2, y: 4, r: 3},
    {x: 2, y: 5, r: 0},
    {x: 3, y: 5, r: 0},
    {x: 4, y: 5, r: 0},
    {x: 5, y: 5, r: 0},
    {x: 5, y: 4, r: 1},
    {x: 5, y: 3, r: 2},
    {x: 4, y: 3, r: 2},
    {x: 3, y: 3, r: 2},
    {x: 3, y: 4, r: 3},
    {x: 4, y: 4, r: 2},
  ];
  tiles: Tile[] = [];
  tileMeshes: THREE.Mesh[] = [];

  initialize(addToScene: (grp: THREE.Group) => void) {
    this.colyseus.getActiveRoom().subscribe((room: Room<GameState>) => {
      const grp: THREE.Group = this.generateField();
      addToScene(grp);
      this.tiles = this.fromSchema(room.state.boardLayout);
      console.log('Tiles are:', this.tiles, room.state.boardLayout);
      this.updateField();

      room.state.boardLayout.onChange = (changes: DataChange<any>[]) => {
        this.tiles = this.fromSchema(room.state.boardLayout);
        console.log('Tiles are:', this.tiles, room.state.boardLayout);
        this.updateField();
      };
    });
  }
  private fromSchema(schema: BoardLayoutState): Tile[] {
    const ret: Tile[] = [];
    for (let i = 0; i < 64; i++) {
      ret.push(schema.tileList[i]);
    }
    return ret;
  }
  getTileRotation(tileID: number): THREE.Quaternion {
    return new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (this.tileCoords[tileID].r / 2) * Math.PI, 0));
  }
  generateField(): THREE.Group {
    const group = new THREE.Group();
    for (let tileId = 0; tileId < 64; tileId++) {
      const tileMesh = this.objectLoader.loadGameTile('/assets/board/default.png');
      tileMesh.position.set(this.centerCoords.x[this.tileCoords[tileId].x], 0.01, this.centerCoords.y[this.tileCoords[tileId].y]);

      tileMesh.rotation.setFromQuaternion(this.getTileRotation(Number(tileId)));
      group.add(tileMesh);
      this.tileMeshes[tileId] = tileMesh;
    }
    const landscapeBoundary = (x1: number, x2: number, y: number) => {
      const len = this.borderCoords.x[x2] - this.borderCoords.x[x1];
      const vec = new THREE.Vector2((this.borderCoords.x[x2] + this.borderCoords.x[x1]) / 2, this.borderCoords.y[y]);
      group.add(this.objectLoader.createBoundary(len, true, vec));
    };
    const portraitBoundary = (x: number, y1: number, y2: number) => {
      const len = this.borderCoords.y[y2] - this.borderCoords.y[y1];
      const vec = new THREE.Vector2(this.borderCoords.x[x], (this.borderCoords.y[y2] + this.borderCoords.y[y1]) / 2);
      group.add(this.objectLoader.createBoundary(len, false, vec));
    };
    landscapeBoundary(1, 8, 1);
    portraitBoundary(1, 1, 7);
    landscapeBoundary(1, 7, 7);
    portraitBoundary(7, 2, 7);
    landscapeBoundary(2, 7, 2);
    portraitBoundary(2, 2, 6);
    landscapeBoundary(2, 6, 6);
    portraitBoundary(6, 3, 6);
    landscapeBoundary(3, 6, 3);
    portraitBoundary(3, 3, 5);
    landscapeBoundary(3, 5, 5);
    portraitBoundary(5, 4, 5);
    landscapeBoundary(4, 5, 4);

    return group;
  }

  getFieldCenter(fieldId: number): {x: number, y: number} {
    const coords: {x: number, y: number} = this.getCoords(fieldId);
    return {
      x: this.centerCoords.x[coords.x],
      y: this.centerCoords.y[coords.y]
    };
  }
  getFieldCoords(fieldId: number): {x1: number, y1: number, x2: number, y2: number} {
    const coords: {x: number, y: number} = this.getCoords(fieldId);
    return {
      x1: this.borderCoords.x[coords.x],
      y1: this.borderCoords.y[coords.y],
      x2: this.borderCoords.x[coords.x + 1],
      y2: this.borderCoords.y[coords.y + 1]
    };
  }
  coordsToFieldCoords(coords: THREE.Vector3): {x: number, y: number} {
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
  getCoords(tileId: number): {x: number, y: number} {
    if (tileId < 0 || tileId > 63) {
      return {x: 7, y: 0};
    }
    return {x: this.tileCoords[tileId].x, y: this.tileCoords[tileId].y};
  }
  getId(x: number, y: number): number {
    for (const t in this.tileCoords) {
      if (this.tileCoords[t].x === x && this.tileCoords[t].y === y) {
        return Number(t);
      }
    }
  }
  getTile(fieldId: number): Tile {
    if (fieldId < 0 || fieldId > 63) {
      return undefined;
    }
    return this.tiles[fieldId];
  }

  updateField() {
    for (const tileId in this.tiles) {
      if (tileId in this.tiles) {
        const mesh: THREE.Mesh = this.tileMeshes[tileId];
        const mat = mesh.material;
        this.objectLoader.loadGameTileTexture(this.tiles[tileId].imageUrl, (tex: THREE.Texture) => {
          mat['map'] = tex;
          mat['needsUpdate'] = true;
        });
      }
    }
  }

}
