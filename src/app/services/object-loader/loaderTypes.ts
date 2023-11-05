import { CubeTexture, Object3D, Texture } from 'three';
import { Subject } from 'rxjs';

export interface ResourceData {
  cname: string;
  fname: string;
  objectCache: Object3D;
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
  lowResTex: Texture;
  tex: Texture;
  spec: Texture;
  subject: Subject<{ tex: Texture; spec: Texture }>;
}

export class PlayerModelData {
  constructor(texFName: string, specFName?: string) {
    this.texFName = texFName;
    this.specFName = specFName || 'default_spec';
    this.lowResTex = undefined;
    this.tex = undefined;
    this.spec = undefined;
    this.subject = new Subject<{ tex: Texture; spec: Texture }>();
  }
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

export interface ICubeMap {
  name: string;
  tex: CubeTexture;
  path: string;
  px: string;
  py: string;
  pz: string;
  nx: string;
  ny: string;
  nz: string;
}

export class CubeMap implements ICubeMap {
  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
    this.tex = undefined;
    this.px = 'posx.jpg';
    this.py = 'posy.jpg';
    this.pz = 'posz.jpg';
    this.nx = 'negx.jpg';
    this.ny = 'negy.jpg';
    this.nz = 'negz.jpg';
  }

  name: string;
  nx: string;
  ny: string;
  nz: string;
  path: string;
  px: string;
  py: string;
  pz: string;
  tex: CubeTexture;
}

export type Progress = [progress: number, total: number];
