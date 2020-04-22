import { Injectable } from '@angular/core';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import {PhysicsEntity, PhysicsEntityVariation} from '../model/WsData';

interface ResourceData {
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
@Injectable({
  providedIn: 'root'
})
export class ObjectLoaderService {
  private readonly resourcePath = '/assets/models/';
  private objectResourceList: EntityList<ResourceData> = {
    dice: {
      default: {
        cname: 'diceDefault',
        fname: 'diceDefault.gltf',
        objectCache: undefined
      },
      dice: {
        cname: 'diceModel',
        fname: 'dice/scene.gltf',
        objectCache: undefined
      },
      dice2: {
        cname: 'diceModel2',
        fname: 'dice2/scene.gltf',
        objectCache: undefined
      }
    },
    figure: {
      default: {
        cname: 'figureDefault',
        fname: 'figureDefault.gltf',
        objectCache: undefined
      }
    }
  };
  constructor() { }

  private getResourceData(obj: PhysicsEntity, variation: PhysicsEntityVariation): ResourceData {
    switch (obj) {
      case PhysicsEntity.dice:
        switch (variation) {
          case PhysicsEntityVariation.default:
            return this.objectResourceList.dice.default;
        }
        break;
      case PhysicsEntity.figure:
        switch (variation) {
          case PhysicsEntityVariation.default:
            return this.objectResourceList.figure.default;
        }
        break;
    }
  }
  loadObject(obj: PhysicsEntity, variation: PhysicsEntityVariation, callback: (model: THREE.Object3D) => void) {
    const resource = this.getResourceData(obj, variation);
    if (resource.objectCache !== undefined) {
      callback(resource.objectCache.clone(true));
    } else {
      const loader = new GLTFLoader().setPath(this.resourcePath);
      loader.load(resource.fname, (gltf: GLTF) => {
        gltf.scene.children[0].castShadow = true;
        gltf.scene.children[0].receiveShadow = true;
        resource.objectCache = gltf.scene.children[0].clone(true);
        callback( gltf.scene.children[0] );
      });
    }
  }
}
