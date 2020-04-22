import {Injectable} from '@angular/core';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import {PhysicsEntity, PhysicsEntityVariation, PlayerModel} from '../model/WsData';

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
interface PlayerModelData {
  texFName: string;
  specFName: string;
  tex: THREE.Texture;
  spec: THREE.Texture;
}
@Injectable({
  providedIn: 'root'
})
export class ObjectLoaderService {
  private readonly resourcePath = '/assets/models/';
  private texList: Map<PlayerModel, PlayerModelData> = new Map<PlayerModel, PlayerModelData>([
    [PlayerModel.bcap_NukaCola, {texFName: 'default', specFName: 'default_spec', tex: undefined, spec: undefined}],
    [PlayerModel.bcap_CocaCola, {texFName: 'cocaCola', specFName: 'default_spec', tex: undefined, spec: undefined}],
    [PlayerModel.bcap_Developer, {texFName: 'dev', specFName: 'default_spec', tex: undefined, spec: undefined}],
    [PlayerModel.bcap_Jagermeister, {texFName: 'jagermeister', specFName: 'default_spec', tex: undefined, spec: undefined}],
    [PlayerModel.bcap_Murica, {texFName: 'murica', specFName: 'default_spec', tex: undefined, spec: undefined}],
    [PlayerModel.bcap_hb, {texFName: 'hb', specFName: 'default_spec', tex: undefined, spec: undefined}],
    [PlayerModel.bcap_OurAnthem, {texFName: 'ourAnthem', specFName: 'default_spec', tex: undefined, spec: undefined}],
    [PlayerModel.bcap_Schmucker, {texFName: 'schmucker', specFName: 'default_spec', tex: undefined, spec: undefined}],
    [PlayerModel.bcap_Tiddies1, {texFName: 'kronkorken1', specFName: 'default_spec', tex: undefined, spec: undefined}],
  ]);
  private readonly entities: ([PhysicsEntity, PhysicsEntityVariation])[] = [
    [PhysicsEntity.dice, PhysicsEntityVariation.default],
    [PhysicsEntity.figure, PhysicsEntityVariation.default],
  ];
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
  switchTex(obj: THREE.Object3D, model: PlayerModel) {
    const texData = this.texList.get(model);
    if (texData.tex === undefined || texData.spec === undefined) {
      const fname = texData.texFName || 'kronkorken1';
      const fnameSpec = texData.specFName || 'kronkorken1';
      const texture = new THREE.TextureLoader().load( '/assets/models/otherTex/' + fname + '.png' );
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = 16;
      texData.tex = texture;
      const gloss = new THREE.TextureLoader().load( '/assets/models/otherTex/' + fnameSpec + '.png' );
      gloss.encoding = THREE.LinearEncoding;
      texData.spec = gloss;
    }

    const mesh: THREE.Mesh = obj as THREE.Mesh;
    if (mesh.material instanceof THREE.Material) {
      mesh.material = mesh.material.clone();
      mesh.material['map'] = texData.tex;
    }
  }

  async loadAllObjects(): Promise<void> {
    const myPromise: Promise<void> = new Promise<void>((resolve, reject) => {
      let i = this.entities.length;
      this.entities.forEach((value: [PhysicsEntity, PhysicsEntityVariation], index: number) => {
        this.loadObject(value[0], value[1], () => {
          i--;
          if (i <= 0) {
            resolve();
          }
        });
      });
    });

    return myPromise;
  }
}
