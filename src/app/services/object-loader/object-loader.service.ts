import { Injectable } from '@angular/core';
import {
  BoxBufferGeometry,
  CubeTexture,
  LinearEncoding,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Sprite,
  Texture,
  Vector2,
} from 'three';
import { PhysicsEntity, PlayerModel } from '../../model/WsData';
import { Observable, Observer, take } from 'rxjs';
import { PlayerModelData, Progress } from './loaderTypes';
import { AssetLoader } from './asset-loader';
import { DynamicAssetProviderService } from './dynamic-asset-provider.service';
import { map, mergeMap } from 'rxjs/operators';
import { PredefinedObjectGenerator } from './predefined-object-generator';

type Disposable = BoxBufferGeometry | Texture;

@Injectable({
  providedIn: 'root',
})
export class ObjectLoaderService {
  private currentCubeMap = 2;

  private defaultTileTexture: Texture;
  private gameBoardGeo: BoxBufferGeometry;
  private gameTileGeo: BoxBufferGeometry;
  private gameBoardMat: MeshStandardMaterial;
  private gameBoundaryMat: MeshStandardMaterial;

  /** Disposable assets */
  private disposableAssets: Disposable[] = [];

  private readonly lowResSuffix = '_256';
  // we are currently not using specific specular maps, to use those, the subject has to also update those
  private playermodels: Map<PlayerModel, PlayerModelData> = AssetLoader.playerModels;

  /** Hardcoded access and parsing of default assets */
  // TODO: This will be properly implemented in the future using further DB models
  private readonly DEFAULT_DICE = 'default_dice_model';
  private readonly DEFAULT_FIGURE = 'default_bcap_model';

  constructor(private dynamicAssets: DynamicAssetProviderService) {
    this.defaultTileTexture = AssetLoader.loadTexture(AssetLoader.defaultTileTexturePath);
    this.gameBoardGeo = new BoxBufferGeometry(100, 1, 100);
    this.gameTileGeo = new BoxBufferGeometry(10, 1, 10);
    this.gameBoardMat = new MeshStandardMaterial({ color: 0xffffff });
    this.gameBoundaryMat = new MeshStandardMaterial({ color: 0xfadd12 });
  }

  dispose(): void {
    console.log(`Disposing ${this.disposableAssets.length} assets.`, this.disposableAssets);
    this.disposableAssets.map((d) => d.dispose());
    this.disposableAssets = [];
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
      const toLoad = this.playermodels.size;
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
      this.loadObject(PhysicsEntity.dice).subscribe((suc) => onProgress());
      this.loadObject(PhysicsEntity.figure).subscribe((suc) => onProgress());
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
    this.getCubeMap(cubeMapId).subscribe((ct) => {
      console.debug('Using Cubemap:', ct.name);
      this.currentCubeMap = cubeMapId;

      this.gameBoundaryMat.envMap = ct;
      this.gameBoundaryMat.needsUpdate = true;

      this.gameBoardMat.envMap = ct;
      this.gameBoardMat.needsUpdate = true;
    });
  }

  getCubeMap(cubeMapId?: number): Observable<CubeTexture> {
    cubeMapId = cubeMapId || this.currentCubeMap;
    return this.dynamicAssets.availableCubeMaps$.pipe(
      take(1),
      mergeMap((cms) => {
        if (cubeMapId < 0 || cubeMapId >= cms.length - 1) {
          console.warn(`Requested cubeMapId: ${cubeMapId} is out of bounds, defaulting to 0.`);
          cubeMapId = 0;
        }
        return this.dynamicAssets.loadCubeMap(cubeMapId).pipe(
          map((cm) => {
            this.disposableAssets.push(cm);
            return cm;
          })
        );
      })
    );
  }

  loadObject(obj: PhysicsEntity): Observable<Object3D> {
    switch (obj) {
      case PhysicsEntity.dice:
        return this.dynamicAssets.loadGltfByName(this.DEFAULT_DICE);
        break;
      case PhysicsEntity.figure:
        return this.dynamicAssets.loadGltfByName(this.DEFAULT_FIGURE);
        break;
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
    return PredefinedObjectGenerator.generateGameBoard();
  }

  generateBordBoundary(length: number, rotatedLandscape: boolean, center: Vector2): Mesh {
    return PredefinedObjectGenerator.generateBordBoundary(length, rotatedLandscape, center);
  }

  generatePlayerLabelSprite(playerName: string): Sprite {
    return PredefinedObjectGenerator.generatePlayerLabelSprite(playerName);
  }

  loadGameTileTexture(texUrl: string): Observable<Texture> {
    const defaultTileTexture: Texture = AssetLoader.loadTexture(AssetLoader.defaultTileTexturePath);
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
}
