import { Injectable } from '@angular/core';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import {PhysicsEntity, PhysicsEntityVariation} from '../model/WsData';

interface ResourceData {
  cname: string;
  fname: string;
}
@Injectable({
  providedIn: 'root'
})
export class ObjectLoaderService {
  private readonly resourcePath = '/assets/models/';
  private readonly objectResourceList = {
    dice: {
      default: {
        cname: 'diceDefault',
        fname: 'diceDefault.gltf'
      },
      dice: {
        cname: 'diceModel',
        fname: 'dice/scene.gltf'
      },
      dice2: {
        cname: 'diceModel2',
        fname: 'dice2/scene.gltf'
      }
    },
    figure: {
      default: {
        cname: 'figureDefault',
        fname: 'figureDefault.gltf'
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
    const loader = new GLTFLoader().setPath(this.resourcePath);
    loader.load(this.getResourceData(obj, variation).fname, (gltf: GLTF) => {
      gltf.scene.children[0].castShadow = true;
      gltf.scene.children[0].receiveShadow = true;
      callback( gltf.scene.children[0] );
    });
  }
}
