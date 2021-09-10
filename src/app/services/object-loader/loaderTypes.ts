import * as THREE from 'three';
import { Subject } from 'rxjs';

export interface ResourceData {
  cname: string;
  fname: string;
  objectCache: THREE.Object3D;
}

export interface DiceVariations<T> {
  default: T;
  dice: T;
  dice2: T;
}

export interface FigureVariations<T> {
  default: T;
}

export interface EntityList<T> {
  dice: DiceVariations<T>;
  figure: FigureVariations<T>;
}

export interface PlayerModelData {
  texFName: string;
  specFName: string;
  lowResTex: THREE.Texture;
  tex: THREE.Texture;
  spec: THREE.Texture;
  subject: Subject<{ tex: THREE.Texture; spec: THREE.Texture }>;
}

export class Color {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  toCSStext(): string {
    return `rgba(${Math.round(this.r * 255)},${Math.round(this.g * 255)},${Math.round(this.b * 255)},${this.a})`;
  }
}

export interface CubeMap {
  name: string;
  tex: THREE.CubeTexture;
  path: string;
  px: string;
  py: string;
  pz: string;
  nx: string;
  ny: string;
  nz: string;
}

export type Progress = [progress: number, total: number];
