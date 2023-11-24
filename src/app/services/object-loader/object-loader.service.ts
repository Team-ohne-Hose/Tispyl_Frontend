import { Injectable } from '@angular/core';
import { BoxBufferGeometry, BufferGeometry, CubeTexture, Material, Mesh, MeshStandardMaterial, Object3D, Sprite, Texture } from 'three';
import { PhysicsEntity, PlayerModel } from '../../model/WsData';
import { Observable, Observer, take } from 'rxjs';
import { AssetLoader } from './asset-loader';
import { DynamicAssetProviderService } from './dynamic-asset-provider.service';
import { map, mergeMap, tap } from 'rxjs/operators';
import { PredefinedObjectGenerator } from './predefined-object-generator';

type Disposable = BufferGeometry | CubeTexture | Texture | Material;

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

    this.disposableAssets.push(this.defaultTileTexture);
    this.disposableAssets.push(this.gameBoardGeo);
    this.disposableAssets.push(this.gameTileGeo);
    this.disposableAssets.push(this.gameBoardMat);
    this.disposableAssets.push(this.gameBoundaryMat);
  }

  dispose(): void {
    console.log(`Disposing ${this.disposableAssets.length} assets.`, this.disposableAssets);
    this.disposableAssets.map((d) => d.dispose());
    this.disposableAssets = [];
  }

  /**
   * This method saves references to all disposable object in the scene tree of a gltf represented by a
   * Object3D that has children.
   * @param g the GLTFs scene as a Object3D
   */
  private _make_gltf_disposable(g: Object3D): void {
    g.traverse((o) => {
      if (o.type === 'Mesh') {
        const mesh = o as Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.map((m) => this.disposableAssets.push(m));
        } else {
          // ToDo: Define what materials we use and properly dispose them not textures are looked at here
          this.disposableAssets.push(mesh.material);
        }
        this.disposableAssets.push(mesh.geometry);
      } else if (o.type === 'Group') {
        // Nothing to do
      }
    });
  }

  getBCapCount(): Observable<number> {
    return this.dynamicAssets.availableTextures$.pipe(
      take(1),
      map((bts) => bts.length)
    );
  }

  getBCapTextureThumbPath(textureId: number): Observable<string> {
    return this.dynamicAssets.availableTextures$.pipe(
      take(1),
      map((bts) => {
        return this.dynamicAssets.pathOf(bts[textureId]);
      })
    );
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

  getNewObject(obj: PhysicsEntity): Observable<Object3D> {
    let obs: Observable<Object3D>;
    switch (obj) {
      case PhysicsEntity.dice:
        obs = this.dynamicAssets.loadGltfByName(this.DEFAULT_DICE);
        break;
      case PhysicsEntity.figure:
        obs = this.dynamicAssets.loadGltfByName(this.DEFAULT_FIGURE);
        break;
    }
    return obs.pipe(tap(this._make_gltf_disposable.bind(this)));
  }

  switchTex(obj: Object3D, materialId: PlayerModel): void {
    if (materialId === undefined) {
      return;
    }
    this.setMaterial(obj, materialId);
  }

  setMaterial(obj: Object3D, materialId: number): void {
    const m: Mesh = this._first_child_mesh(obj);
    const textures$ = this.dynamicAssets.loadTexture(materialId);
    textures$.pipe(take(1)).subscribe({
      next: (tex: Texture) => {
        // ToDo: Properly define what types of materials we want to use and understand how glossyness can be translated
        // currently we just use the old material and set a new albedo texture on it as we dont know exactly how to make it
        // look good otherwise.
        this.disposableAssets.push(tex);
        if (m.material instanceof Array) {
          m.material[0]['map'] = tex;
        } else {
          m.material['map'] = tex;
        }
      },
    });
  }

  private _first_child_mesh(obj: Object3D): Mesh {
    const MESH_TYPE = 'Mesh';
    if (obj.type === MESH_TYPE) {
      return obj as Mesh;
    } else {
      let o_tmp: Mesh<BufferGeometry, Material | Material[]>;
      obj.traverse((o) => {
        if (o.type === MESH_TYPE) {
          o_tmp = o as Mesh;
        }
      });
      return o_tmp;
    }
  }

  generateGameBoard(): Mesh {
    const tex = AssetLoader.loadTexture(AssetLoader.defaultGameboardTexturePath);
    const gb = PredefinedObjectGenerator.generateGameBoard(tex);
    this.disposableAssets.push(tex);
    this.disposableAssets.push(gb.material as Material);
    this.disposableAssets.push(gb.geometry);
    return gb;
  }

  generatePlayerLabelSprite(playerName: string): Sprite {
    return PredefinedObjectGenerator.generatePlayerLabelSprite(playerName);
  }

  loadGameTileTexture(texUrl: string): Observable<Texture> {
    const defaultTileTexture: Texture = AssetLoader.loadTexture(AssetLoader.defaultTileTexturePath);
    this.disposableAssets.push(defaultTileTexture);
    return new Observable<Texture>((observer: Observer<Texture>) => {
      AssetLoader.loadTexture(
        texUrl,
        (texture: Texture) => {
          this.disposableAssets.push(texture);
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
    this.disposableAssets.push(gameTileMat);
    return gameTile;
  }
}
