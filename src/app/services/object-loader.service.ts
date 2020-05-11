import {Injectable} from '@angular/core';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import {PhysicsEntity, PhysicsEntityVariation, PlayerModel} from '../model/WsData';
import {SceneBuilderService} from './scene-builder.service';

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
@Injectable({
  providedIn: 'root'
})
export class ObjectLoaderService {
  cubeMaps: CubeMap[] = [
    {name: 'Ryfjallet', tex: undefined, path: '/assets/cubemaps/mountain-skyboxes/Ryfjallet/',
      px: 'posx.jpg', py: 'posy.jpg', pz: 'posz.jpg', nx: 'negx.jpg', ny: 'negy.jpg', nz: 'negz.jpg'},
    {name: 'Maskonaive1', tex: undefined, path: '/assets/cubemaps/mountain-skyboxes/Maskonaive/',
      px: 'posx.jpg', py: 'posy.jpg', pz: 'posz.jpg', nx: 'negx.jpg', ny: 'negy.jpg', nz: 'negz.jpg'},
    {name: 'Maskonaive2', tex: undefined, path: '/assets/cubemaps/mountain-skyboxes/Maskonaive2/',
      px: 'posx.jpg', py: 'posy.jpg', pz: 'posz.jpg', nx: 'negx.jpg', ny: 'negy.jpg', nz: 'negz.jpg'},
    {name: 'Maskonaive3', tex: undefined, path: '/assets/cubemaps/mountain-skyboxes/Maskonaive3/',
      px: 'posx.jpg', py: 'posy.jpg', pz: 'posz.jpg', nx: 'negx.jpg', ny: 'negy.jpg', nz: 'negz.jpg'},
    {name: 'Nalovardo', tex: undefined, path: '/assets/cubemaps/mountain-skyboxes/Nalovardo/',
      px: 'posx.jpg', py: 'posy.jpg', pz: 'posz.jpg', nx: 'negx.jpg/', ny: 'negy.jpg', nz: 'negz.jpg'},
    {name: 'Teide', tex: undefined, path: '/assets/cubemaps/mountain-skyboxes/Teide',
      px: 'posx.jpg', py: 'posy.jpg', pz: 'posz.jpg', nx: 'negx.jpg/', ny: 'negy.jpg', nz: 'negz.jpg'},
  ];
  currentCubeMap = 0;
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
    [PlayerModel.bcap_cat, {texFName: 'catGoblin', specFName: 'default_spec', tex: undefined, spec: undefined}],
    [PlayerModel.bcap_yoshi, {texFName: 'yoshi', specFName: 'default_spec', tex: undefined, spec: undefined}],
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
  tLoader = new THREE.TextureLoader();
  defaultTileTexture: THREE.Texture;
  defaultTileTexturePath = '/assets/board/default.png';

  gameTileGeo = new THREE.BoxBufferGeometry(10, 1, 10);
  private gameBoundaryMat = new THREE.MeshStandardMaterial({color: 0xFADD12});

  constructor(private sceneBuilder: SceneBuilderService) {
    this.tLoader.load(this.defaultTileTexturePath, (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = 16;
      this.defaultTileTexture = texture;
    }, undefined, (error) => {
      console.error(error);
    });
  }

  setCurrentCubeMap(cubeMapId: number) {
    if (cubeMapId >= 0) {
      const cubemap = this.getCubeMap(cubeMapId);
      this.currentCubeMap = cubeMapId;

      this.gameBoundaryMat.envMap = cubemap;
      this.gameBoundaryMat.needsUpdate = true;

      this.sceneBuilder.setEnvMaps(cubemap);
    }
  }
  getCubeMap(cubeMapId?: number): THREE.CubeTexture {
    cubeMapId = cubeMapId || this.currentCubeMap;
    if (this.cubeMaps[cubeMapId].tex === undefined) {
      const tex = new THREE.CubeTextureLoader()
        .setPath(this.cubeMaps[cubeMapId].path)
        .load( [ this.cubeMaps[cubeMapId].px,
          this.cubeMaps[cubeMapId].nx,
          this.cubeMaps[cubeMapId].py,
          this.cubeMaps[cubeMapId].ny,
          this.cubeMaps[cubeMapId].pz,
          this.cubeMaps[cubeMapId].nz ]);
      this.cubeMaps[cubeMapId].tex = tex;
    }
    return this.cubeMaps[cubeMapId].tex;
  }

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
    let texData: PlayerModelData = this.texList.get(model);
    if (texData === undefined) {
      texData = this.texList.get(PlayerModel.bcap_NukaCola);
    }
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

  private drawCanvas(canvas: HTMLCanvasElement,
                     text: string,
                     fontSize: number,
                     font: string,
                     textColor: Color,
                     backgroundColor: Color,
                     borderColor: Color,
                     borderThickness: number,
                     radius: number) {
    const context = canvas.getContext('2d');
    context.font = 'Bold ' + fontSize + 'px ' + font;

    // get size data (height depends only on font size)
    const metrics = context.measureText( text );
    const textWidth = metrics.width;
    canvas.width = textWidth + borderThickness;
    context.font = fontSize + 'px ' + font; // 'Bold ' +

    // background color
    context.fillStyle   = backgroundColor.toCSStext();
    // border color
    context.strokeStyle = borderColor.toCSStext();

    context.lineWidth = borderThickness;
    ((ctx, x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    })(context, borderThickness / 2, borderThickness / 2, textWidth, fontSize * 1.4, radius);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = textColor.toCSStext();

    context.fillText( text, borderThickness, fontSize + borderThickness);

  }
  updateLabelSpriteText(sprite: THREE.Sprite, text: string) {
    sprite.userData.text = ' ' + text + ' ';
    this.drawCanvas(sprite.userData.canvas, sprite.userData.text, sprite.userData.fontSize, sprite.userData.font, sprite.userData.textColor,
    sprite.userData.backgroundColor, sprite.userData.borderColor, sprite.userData.borderThickness, sprite.userData.radius);
  }
  createLabelSprite(text: string,
                    fontSize?: number,
                    font?: string,
                    textColor?: Color,
                    backgroundColor?: Color,
                    borderColor?: Color,
                    borderThickness?: number,
                    radius?: number): THREE.Sprite {
    fontSize = fontSize || 16;
    font = font || 'Arial';
    textColor = textColor || new Color(1, 1, 1, 1);
    backgroundColor = backgroundColor || new Color(0, 0, 0, 1);
    borderColor = borderColor || new Color(0.1, 0.1, 0.1, 1);
    borderThickness = borderThickness || 4;
    radius = radius || 6;

    text = ' ' + text + ' ';

    const canvas = document.createElement('canvas');
    canvas.width = 300 + borderThickness;
    canvas.height = fontSize * 1.4 + borderThickness;

    this.drawCanvas(canvas, text, fontSize, font, textColor, backgroundColor, borderColor, borderThickness, radius);

    const spriteMap: THREE.CanvasTexture = new THREE.CanvasTexture(canvas);
    spriteMap.anisotropy = 16;
    // canvas contents will be used for a texture
    const spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );
    spriteMaterial.transparent = true;
    const sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(canvas.width / 75, canvas.height / 75, 1);
    // console.log(canvas, context, context.font, textWidth + borderThickness, fontSize * 1.4 + borderThickness);
    // document.body.appendChild(canvas);
    sprite.userData.canvas = canvas;
    sprite.userData.text = text;
    sprite.userData.fontSize = fontSize;
    sprite.userData.font = font;
    sprite.userData.textColor = textColor;
    sprite.userData.backgroundColor = backgroundColor;
    sprite.userData.borderColor = borderColor;
    sprite.userData.borderThickness = borderThickness;
    sprite.userData.radius = radius;
    return sprite;
  }
  loadGameTileTexture(texUrl: string, onLoad: (tex: THREE.Texture) => void) {
    this.tLoader.load(texUrl, (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = 16;
      onLoad(texture);
    }, undefined, (error) => {
      console.error(error);
      onLoad(this.defaultTileTexture);
    });
  }
  loadGameTile(): THREE.Mesh {
    const gameTileMat = new THREE.MeshStandardMaterial({color: 0xffffff});
    gameTileMat.roughness = .8;
    const gameTile = new THREE.Mesh(this.gameTileGeo, gameTileMat);
    gameTile.castShadow = true;
    gameTile.receiveShadow = true;
    gameTile.name = 'gametile';

    gameTileMat.map = this.defaultTileTexture;
    gameTileMat.needsUpdate = true;
    console.log('adding DefaultTex');
    return gameTile;
  }
  createBoundary(length: number, rotatedLandscape: boolean, center: THREE.Vector2) {
    let w = .3, d = .3;
    if (rotatedLandscape) {
      w = length + .3;
    } else {
      d = length + .3;
    }

    const gameBoundaryGeo = new THREE.BoxBufferGeometry(w, .3, d);
    this.gameBoundaryMat.metalness = 1;
    this.gameBoundaryMat.roughness = .06;
    const gameBoundary = new THREE.Mesh(gameBoundaryGeo, this.gameBoundaryMat);
    gameBoundary.castShadow = true;
    gameBoundary.receiveShadow = true;
    gameBoundary.position.set(center.x, 0.7, center.y);
    return gameBoundary;

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
