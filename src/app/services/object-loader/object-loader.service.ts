import { Injectable } from '@angular/core';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  BoxBufferGeometry,
  CanvasTexture,
  CubeTexture,
  LinearEncoding,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector2,
} from 'three';
import { PhysicsEntity, PhysicsEntityVariation, PlayerModel } from '../../model/WsData';
import { Observable, Observer } from 'rxjs';
import { Color, PlayerModelData, Progress, ResourceData } from './loaderTypes';
import { ClickedTarget } from 'src/app/components/game/viewport/helpers/PhysicsCommands';
import { AssetLoader } from './asset-loader';

type Disposable = Mesh | BoxBufferGeometry | Texture | Material;

@Injectable({
  providedIn: 'root',
})
export class ObjectLoaderService {
  private loadedObjects: Disposable[] = [];
  private currentCubeMap = 2;

  private defaultTileTexture: Texture;
  private gameBoardGeo: BoxBufferGeometry;
  private gameTileGeo: BoxBufferGeometry;
  private gameBoardMat: MeshStandardMaterial;
  private gameBoundaryMat: MeshStandardMaterial;

  //private playerFigureMaterialStore: Map<PlayerModel>

  private readonly lowResSuffix = '_256';
  // we are currently not using specific specular maps, to use those, the subject has to also update those
  private playermodels: Map<PlayerModel, PlayerModelData> = AssetLoader.playerModels;

  private readonly entities: [PhysicsEntity, PhysicsEntityVariation][] = [
    [PhysicsEntity.dice, PhysicsEntityVariation.default],
    [PhysicsEntity.figure, PhysicsEntityVariation.default],
  ];

  constructor() {
    this.defaultTileTexture = AssetLoader.loadTexture(AssetLoader.defaultTileTexturePath);
    this.gameBoardGeo = new BoxBufferGeometry(100, 1, 100);
    this.gameTileGeo = new BoxBufferGeometry(10, 1, 10);
    this.gameBoardMat = new MeshStandardMaterial({ color: 0xffffff });
    this.gameBoundaryMat = new MeshStandardMaterial({ color: 0xfadd12 });

    this.loadedObjects.push(this.defaultTileTexture);
    this.loadedObjects.push(this.gameBoardGeo);
    this.loadedObjects.push(this.gameTileGeo);
    this.loadedObjects.push(this.gameBoardMat);
    this.loadedObjects.push(this.gameBoundaryMat);
  }

  getBCapCount(): number {
    return this.playermodels.size;
  }

  getBCapTextureThumbPath(modelId: number): string {
    const playerModel: PlayerModelData = this.playermodels.get(modelId);
    return AssetLoader.playerModelThumbnailPath + (playerModel === undefined ? 'default' : playerModel.texFName) + '_128.png';
  }

  loadCommonObjects(): Observable<Progress> {
    return new Observable<Progress>((observer: Observer<Progress>) => {
      // TODO: Load all Playertextures as well
      const toLoad = this.playermodels.size + this.entities.length;
      let progress = 0;
      const onProgress = () => {
        progress++;
        observer.next([progress, toLoad]); // onProgressCallback(progress, toLoad);
        if (progress >= toLoad) {
          observer.complete();
        }
      };

      this.playermodels.forEach((val: PlayerModelData, key: PlayerModel) => {
        this.loadBcapLowRes(key, onProgress);
      });

      this.entities.forEach((value: [PhysicsEntity, PhysicsEntityVariation], index: number) => {
        this.loadObject(value[0], value[1], onProgress);
      });
    });
  }

  async loadHiResTex(): Promise<void> {
    this.playermodels.forEach((val: PlayerModelData, key: PlayerModel) => {
      this.loadBcapTex(key, (tex: Texture, spec: Texture) => {
        val.subject.next({ tex: tex, spec: spec });
      });
    });
  }

  setCurrentCubeMap(cubeMapId: number): void {
    if (cubeMapId >= 0) {
      const cubemap = this.getCubeMap(cubeMapId);
      console.debug('Using Cubemap:', AssetLoader.cubeMaps[cubeMapId].name, cubeMapId, AssetLoader.cubeMaps[cubeMapId]);
      this.currentCubeMap = cubeMapId;

      this.gameBoundaryMat.envMap = cubemap;
      this.gameBoundaryMat.needsUpdate = true;

      this.gameBoardMat.envMap = cubemap;
      this.gameBoardMat.needsUpdate = true;
    }
  }

  getCubeMap(cubeMapId?: number): CubeTexture {
    cubeMapId = cubeMapId || this.currentCubeMap;
    if (AssetLoader.cubeMaps[cubeMapId].tex === undefined) {
      AssetLoader.cubeMaps[cubeMapId].tex = AssetLoader.loadCubeTexture(cubeMapId);
    }
    return AssetLoader.cubeMaps[cubeMapId].tex;
  }

  loadObject(obj: PhysicsEntity, variation: PhysicsEntityVariation, callback: (model: Object3D) => void): void {
    const resource = this.getResourceData(obj, variation);
    if (resource.objectCache !== undefined) {
      callback(resource.objectCache.clone(true));
    } else {
      AssetLoader.loadGLTF(resource.fname, (gltf: GLTF) => {
        gltf.scene.name = resource.cname + ' (loaded)';
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        gltf.scene.children.forEach((o) => {
          o.castShadow = true;
        });
        resource.objectCache = gltf.scene.clone(true);
        callback(gltf.scene);
      });
    }
  }

  switchTex(obj: Object3D, model: PlayerModel): void {
    if (model === undefined) {
      return;
    }
    // filter out non-Mesh Objects, this makes sure to not refer to the group containing the mesh
    while (!(obj.type === 'Mesh')) {
      if (obj.children.length <= 0) {
        console.warn('Did not find mesh to swap texture(has no children)');
        return;
      }
      obj = obj.children[0];
      if (obj === undefined) {
        console.warn('Did not find mesh to swap texture(child is undefined)');
        return;
      }
    }

    // gather correct Texture
    const tex = this.getTexture(model);

    const mesh: Mesh = obj as Mesh;

    if (!(mesh.material instanceof Array) && mesh.material.isMaterial && tex !== undefined) {
      mesh.material = mesh.material.clone();
      mesh.material['map'] = tex;

      const unsubscribeFunc = mesh.userData['textureUnsubscribeFunc'] as () => void;
      if (unsubscribeFunc !== undefined) {
        unsubscribeFunc();
      }
      mesh.userData['textureUnsubscribeFunc'] = this.playermodels
        .get(model)
        .subject.subscribe((newTexture: { tex: Texture; spec: Texture }) => {
          mesh.material = (mesh.material as Material).clone();
          mesh.material['map'] = newTexture.tex;
          mesh.material['specularMap'] = newTexture.spec;
          //mesh.material['glossinessMap'] = newTexture.spec;
        })
        .unsubscribe.bind(this);
    } else {
      console.warn('Material or texture do not have the correct format');
    }
  }

  loadTex(fname: string, fnameSpec: string): { tex: Texture; spec: Texture } {
    const texture = AssetLoader.loadTexture('/assets/models/otherTex/' + fname + '.png');
    const gloss = AssetLoader.loadTexture('/assets/models/otherTex/' + fnameSpec + '.png');
    gloss.encoding = LinearEncoding;
    return { tex: texture, spec: gloss };
  }

  loadBcapLowRes(model: PlayerModel, onDone: (tex: Texture, spec: Texture) => void): void {
    const texData: PlayerModelData = this.playermodels.get(model);
    if (texData !== undefined) {
      const fname = texData.texFName || 'kronkorken1';
      const fnameSpec = texData.specFName || 'kronkorken1';
      const texMaps = this.loadTex(fname + this.lowResSuffix, fnameSpec + this.lowResSuffix);
      texData.lowResTex = texMaps.tex;
      if (texData.spec === undefined) {
        texData.spec = texMaps.spec;
      }

      // only notify, if no hires tex exists
      if (texData.tex === undefined) {
        texData.subject.next({ tex: texMaps.tex, spec: texMaps.spec });
      }
      onDone(texMaps.tex, texMaps.spec);
    } else {
      onDone(undefined, undefined);
    }
  }

  loadBcapTex(model: PlayerModel, onDone: (tex: Texture, spec: Texture) => void): void {
    const texData: PlayerModelData = this.playermodels.get(model);
    if (texData !== undefined) {
      const fname = texData.texFName || 'kronkorken1';
      const fnameSpec = texData.specFName || 'kronkorken1';
      const texMaps = this.loadTex(fname, fnameSpec);
      texData.tex = texMaps.tex;
      texData.spec = texMaps.spec;

      texData.subject.next({ tex: texData.tex, spec: texData.spec });
      onDone(texMaps.tex, texMaps.spec);
    } else {
      onDone(undefined, undefined);
    }
  }

  generateGameBoard(): Mesh {
    const gameBoard: Mesh<BoxBufferGeometry, MeshStandardMaterial> = new Mesh(this.gameBoardGeo, this.gameBoardMat);
    gameBoard.position.y = -0.1;
    gameBoard.castShadow = false;
    gameBoard.receiveShadow = true;
    gameBoard.name = 'gameboard';
    gameBoard.userData.clickRole = ClickedTarget.board;
    this.gameBoardMat.roughness = 0.475;
    this.gameBoardMat.map = AssetLoader.loadTexture(AssetLoader.defaultGameboardTexturePath);
    this.gameBoardMat.needsUpdate = true;
    return gameBoard;
  }

  loadGameTileTexture(texUrl: string): Observable<Texture> {
    const defaultTileTexture: Texture = AssetLoader.loadTexture(AssetLoader.defaultTileTexturePath);
    this.loadedObjects.push(defaultTileTexture);
    return new Observable<Texture>((observer: Observer<Texture>) => {
      const t: Texture = AssetLoader.loadTexture(
        texUrl,
        (texture: Texture) => {
          observer.next(texture);
          observer.complete();
        },
        undefined,
        (error) => {
          console.error(error);
          observer.next(defaultTileTexture);
          observer.complete();
        }
      );
      this.loadedObjects.push(t);
    });
  }

  loadGameTile(): Mesh {
    const gameTileMat = new MeshStandardMaterial({ color: 0xffffff });
    gameTileMat.roughness = 0.8;
    const gameTile = new Mesh(this.gameTileGeo, gameTileMat);
    gameTile.receiveShadow = true;
    gameTile.name = 'gametile';

    gameTileMat.map = this.defaultTileTexture;
    gameTileMat.needsUpdate = true;
    return gameTile;
  }

  createBoundary(length: number, rotatedLandscape: boolean, center: Vector2): Mesh {
    let w = 0.3,
      d = 0.3;
    if (rotatedLandscape) {
      w = length + 0.3;
    } else {
      d = length + 0.3;
    }

    const gameBoundaryGeo = new BoxBufferGeometry(w, 0.3, d);
    this.gameBoundaryMat.metalness = 1;
    this.gameBoundaryMat.roughness = 0.06;
    const gameBoundary = new Mesh(gameBoundaryGeo, this.gameBoundaryMat);
    gameBoundary.castShadow = true;
    gameBoundary.receiveShadow = true;
    gameBoundary.position.set(center.x, 0.7, center.y);
    return gameBoundary;
  }

  createPlayerLabelSprite(playerName: string): Sprite {
    return this.createLabelSprite(
      playerName,
      70,
      'Roboto',
      new Color(1, 1, 1, 1),
      new Color(0.24, 0.24, 0.24, 0.9),
      new Color(0.1, 0.1, 0.1, 0),
      0,
      4
    );
  }

  createLabelSprite(
    text: string,
    fontSize?: number,
    font?: string,
    textColor?: Color,
    backgroundColor?: Color,
    borderColor?: Color,
    borderThickness?: number,
    radius?: number
  ): Sprite {
    // Default values
    fontSize = fontSize || 16;
    font = font || 'Arial';
    textColor = textColor || new Color(1, 1, 1, 1);
    backgroundColor = backgroundColor || new Color(0, 0, 0, 1);
    borderColor = borderColor || new Color(0.1, 0.1, 0.1, 1);
    borderThickness = borderThickness || 4;
    radius = radius || 6;

    text = ' ' + text + ' ';

    // Build the HTMLCanvas that text is rendered to
    const canvas = document.createElement('canvas');
    canvas.width = 300 + borderThickness;
    canvas.height = fontSize * 1.4 + borderThickness;
    this.drawCanvas(canvas, text, fontSize, font, textColor, backgroundColor, borderColor, borderThickness, radius);
    const spriteMap: CanvasTexture = new CanvasTexture(canvas);
    spriteMap.anisotropy = 16;

    // Create a sprite that is then rendered in the 3D world of WebGL
    const spriteMaterial = new SpriteMaterial({ map: spriteMap });
    spriteMaterial.transparent = true;
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 75, canvas.height / 75, 1);
    return sprite;
  }

  private getResourceData(obj: PhysicsEntity, variation: PhysicsEntityVariation): ResourceData {
    switch (obj) {
      case PhysicsEntity.dice:
        switch (variation) {
          case PhysicsEntityVariation.default:
            return AssetLoader.availableDice.default;
        }
        break;
      case PhysicsEntity.figure:
        switch (variation) {
          case PhysicsEntityVariation.default:
            return AssetLoader.availableFigures.default;
        }
        break;
    }
  }

  private getTexture(model: PlayerModel): Texture {
    let texData: PlayerModelData = this.playermodels.get(model);
    if (texData === undefined) {
      console.warn('texData unknown, returning with default texture');
      texData = this.playermodels.get(PlayerModel.bcap_NukaCola);
    }

    if (texData.spec !== undefined && texData.tex !== undefined) {
      return texData.tex;
    } else if (texData.spec !== undefined && texData.lowResTex !== undefined) {
      return texData.lowResTex;
    } else {
      this.loadBcapTex(model, (tex, spec) => {
        console.warn('texData not cohesive, loading texture');
        if (tex === undefined) console.error('Error loading bcap texture', model);
      });
      return undefined;
    }
  }

  private drawCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    fontSize: number,
    font: string,
    textColor: Color,
    backgroundColor: Color,
    borderColor: Color,
    borderThickness: number,
    radius: number
  ) {
    const context = canvas.getContext('2d');
    context.font = 'Bold ' + fontSize + 'px ' + font;

    // get size data (height depends only on font size)
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    canvas.width = textWidth + borderThickness;
    context.font = fontSize + 'px ' + font;
    context.fillStyle = backgroundColor.toCSStext();
    context.strokeStyle = borderColor.toCSStext();
    context.lineWidth = borderThickness;
    this.drawSvgBackground(context, borderThickness / 2, borderThickness / 2, textWidth, fontSize * 1.4, radius);
    context.fillStyle = textColor.toCSStext();
    context.fillText(text, borderThickness, fontSize + borderThickness);
  }

  private drawSvgBackground(ctx, x, y, w, h, r) {
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
  }
}
