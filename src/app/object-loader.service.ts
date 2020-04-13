import { Injectable } from '@angular/core';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';


enum LoadableObject {
  dice = 'dice',
  dice2 = 'dice2'
}

@Injectable({
  providedIn: 'root'
})
export class ObjectLoaderService {
  static readonly LoadableObject = LoadableObject;

  private objectResourceList = {
    dice: {
      cname: 'diceModel',
      resourcePath: '/assets/models/dice/',
      fname: 'scene.gltf',
      rootObj: 'pCube22'
    },
    dice2: {
      cname: 'diceModel2',
      resourcePath: '/assets/models/dice2/',
      fname: 'scene.gltf',
      rootObj: 'Cube'
    }
  };
  constructor() { }

  loadObject(toLoad: LoadableObject, callback: (model: THREE.Object3D) => void) {
    const loader = new GLTFLoader().setPath(this.objectResourceList[toLoad].resourcePath);
    loader.load(this.objectResourceList[toLoad].fname, (gltf: GLTF) => {
      gltf.scene.children[0].castShadow = true;
      gltf.scene.children[0].receiveShadow = true;
      console.log(gltf.scene.children[0]);
      let toScan = gltf.scene.children;
      while (true) {
        if (toScan.length === 0) {
          break;
        }
        for (const c in toScan) {
          if (c in toScan && toScan[c].name === this.objectResourceList[toLoad].rootObj) {
            callback( toScan[c] );
            return;
          }
        }
        toScan = toScan[0].children;
      }
    });
  }
}
