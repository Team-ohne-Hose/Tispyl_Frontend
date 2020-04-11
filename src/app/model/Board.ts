// @ts-ignore
import boardTiles from '../resources/boardTiles.json';

export interface Tile {
  id: number;
  x: number;
  y: number;
  translationKey: string;
  imageUrl: string;
}
export class Board {
  constructor() {
  }

  static getCoords(fieldId: number): {x: number, y: number} {
    if (fieldId < 0 || fieldId > 63) {
      return {x: 7, y: 0};
    }
    return {x: boardTiles.base[fieldId].x, y: boardTiles.base[fieldId].y};
  }
  static getId(x: number, y: number): number {
    for (const t in boardTiles.base) {
      if (boardTiles.base[t].x === x && boardTiles.base[t].y === y) {
        return Number(t);
      }
    }
  }

  static getTile(fieldId: number): Tile {
    if (fieldId < 0 || fieldId > 63) {
      return {id: 0, x: 7, y: 0, translationKey: 'untitled', imageUrl: '/assets/board/default.png'};
    }
    return boardTiles.base[fieldId];
  }
}
