import { Injectable } from '@angular/core';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {Group} from 'three';


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
      fname: 'scene.gltf'
    },
    dice2: {
      cname: 'diceModel2',
      resourcePath: '/assets/models/dice2/',
      fname: 'scene.gltf'
    }
  };
  constructor() { }

  loadObject(toLoad: LoadableObject, callback: (model: Group) => void) {
    const loader = new GLTFLoader().setPath(this.objectResourceList[toLoad].resourcePath);
    loader.load(this.objectResourceList[toLoad].fname, (gltf: GLTF) => {
      gltf.scene.children[0].castShadow = true;
      gltf.scene.children[0].receiveShadow = true;
      console.log(gltf.scene.children[0]);
      callback(gltf.scene);
    });
  }
}
