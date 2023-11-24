import { Injectable, OnDestroy } from '@angular/core';
import { BackendCubeMap, BackendGltf, BackendTexture, FileService } from '../file.service';
import { Observable, Observer, ReplaySubject, Subscription, take } from 'rxjs';
import { CubeTexture, Material, Object3D, Texture, TextureLoader, sRGBEncoding } from 'three';
import { map, mergeMap, tap } from 'rxjs/operators';
import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { environment } from '../../../environments/environment';
import { Disposable } from './object-loader.service';
import { MD5 } from 'object-hash';

// ToDo: This should actually be a map
interface CacheEntry<T> {
  hash: string;
  instance: T;
}

type Cache<T> = CacheEntry<T>[];

@Injectable({
  providedIn: 'root',
})
export class DynamicAssetProviderService implements OnDestroy {
  /** Loader objects */
  private readonly basePath = environment.endpoint + 'assets/static/';
  private readonly textureLoader: TextureLoader = new TextureLoader();
  private readonly cubeTextureLoader: CubeTextureLoader = new CubeTextureLoader();
  private readonly gltfLoader: GLTFLoader = new GLTFLoader();

  /** Available assets */
  public availableTextures$: ReplaySubject<BackendTexture[]> = new ReplaySubject<BackendTexture[]>(1);
  private availableTextures$$: Subscription;
  public availableModels$: ReplaySubject<BackendGltf[]> = new ReplaySubject<BackendGltf[]>(1);
  private availableModels$$: Subscription;
  public availableCubeMaps$: ReplaySubject<BackendCubeMap[]> = new ReplaySubject<BackendCubeMap[]>(1);
  private availableCubeMaps$$: Subscription;

  /** Cache instances */
  private textureCache: Cache<Texture> = [];
  private cubeTextureCache: Cache<CubeTexture> = [];
  private gltfCache: Cache<GLTF> = [];

  constructor(private fileService: FileService) {
    this.gltfLoader.setPath(this.basePath);
    this.textureLoader.setPath(this.basePath);
    this.cubeTextureLoader.setPath(this.basePath);
    this.refreshAvailableAssets();
  }

  public loadGltfByName(name: string, onDisposable?: (d: Disposable) => void): Observable<Object3D> {
    return this.availableModels$.pipe(
      take(1),
      mergeMap((gltfs) => {
        const gltf = gltfs.find((g) => g.name === name);
        if (gltf) {
          console.debug(`Loading gltf, name: ${name} object:`, gltf);
          return this._cachedLoadGltf(gltf, onDisposable).pipe(map((g) => g.scene));
        }
        throw Error(`Could not find gltf with the name: ${name}`);
      })
    );
  }

  public loadGltf(id: number, onDisposable?: (d: Disposable) => void): Observable<Object3D> {
    return this.availableModels$.pipe(
      take(1),
      mergeMap((bGltfs) => {
        console.debug(`Loading gltf, id:${id} object:`, bGltfs[id]);
        return this._cachedLoadGltf(bGltfs[id], onDisposable).pipe(map((g) => g.scene));
      })
    );
  }

  private _cachedLoadGltf(bGltf: BackendGltf, onDisposable?: (d: Disposable) => void): Observable<GLTF> {
    const cacheEntry: CacheEntry<GLTF> = this.gltfCache.find((entry) => entry.hash === bGltf.asset_file);
    if (cacheEntry !== undefined) {
      // Cache hit
      return new Observable((o: Observer<GLTF>) => {
        const cacheGltf = cacheEntry.instance as GLTF;
        cacheGltf.scene = cacheGltf.scene.clone();
        cacheGltf.scene.traverse((o) => (o.userData = {}));
        o.next(cacheGltf);
        o.complete();
      });
    } else {
      // Cache miss
      return this._loadGltf(bGltf, onDisposable).pipe(
        tap((g) => {
          this.gltfCache.push({ hash: bGltf.asset_file, instance: g });
        })
      );
    }
  }

  private _loadGltf(bGltf: BackendGltf, onDisposable?: (d: Disposable) => void): Observable<GLTF> {
    return new Observable<GLTF>((o: Observer<GLTF>) => {
      this.gltfLoader.load(bGltf.asset_file, (g: GLTF) => {
        if (onDisposable) {
          for (const k of g.parser.associations.keys()) {
            if (k instanceof Material || k instanceof Texture) {
              onDisposable(k as Disposable);
            }
          }
        }
        g.scene.name = 'gltf_' + bGltf.name;
        g.scene.castShadow = true;
        g.scene.receiveShadow = true;
        g.scene.children.forEach((o3d) => {
          o3d.castShadow = true;
        });
        o.next(g);
        o.complete();
      });
    });
  }

  public loadCubeMap(id: number): Observable<CubeTexture> {
    return this.availableCubeMaps$.pipe(
      take(1),
      map((bCubeMaps) => {
        console.debug(`Loading cube map, id:${id} object: ${bCubeMaps[id]}`);
        return this._cachedLoadCubeMap(bCubeMaps[id]);
      })
    );
  }

  private _cachedLoadCubeMap(bCubeMap: BackendCubeMap): CubeTexture {
    const currentHash = this._cmHash(bCubeMap);
    const cacheEntry: CacheEntry<CubeTexture> = this.cubeTextureCache.find((entry) => entry.hash === currentHash);
    if (cacheEntry !== undefined) {
      return cacheEntry.instance;
    } else {
      return this._loadCubeMap(bCubeMap);
    }
  }

  private _loadCubeMap(bCubeMap: BackendCubeMap): CubeTexture {
    const cubeTex = this.cubeTextureLoader.load([
      bCubeMap.texture_pos_x.asset_file,
      bCubeMap.texture_neg_x.asset_file,
      bCubeMap.texture_pos_y.asset_file,
      bCubeMap.texture_neg_y.asset_file,
      bCubeMap.texture_pos_z.asset_file,
      bCubeMap.texture_neg_z.asset_file,
    ]);
    cubeTex.name = 'cubemap_' + bCubeMap.name;
    return cubeTex;
  }

  private _cmHash(bCubeMap: BackendCubeMap): string {
    const a = String([
      bCubeMap.texture_pos_x.asset_file,
      bCubeMap.texture_pos_y.asset_file,
      bCubeMap.texture_pos_z.asset_file,
      bCubeMap.texture_neg_x.asset_file,
      bCubeMap.texture_neg_y.asset_file,
      bCubeMap.texture_neg_z.asset_file,
    ]);
    return MD5(a);
  }

  public loadTextureByName(name: string): Observable<Texture> {
    return this.availableTextures$.pipe(
      take(1),
      map((bTextures) => {
        const bTex = bTextures.find((t) => t.name === name);
        if (bTex) {
          console.debug(`Loading Texture, name: ${name} object:`, bTex);
          return this._loadTexture(bTex);
        }
        throw Error(`Could not find Texture with the name: ${name}`);
      })
    );
  }

  // ToDo: Implement cached version of this function like it is done above
  public loadTexture(id: number): Observable<Texture> {
    return this.availableTextures$.pipe(
      take(1),
      map((bTextures) => {
        console.debug(`Loading texture, id:${id} object: `, bTextures[id]);
        return this._loadTexture(bTextures[id]);
      })
    );
  }

  private _loadTexture(bTexture: BackendTexture) {
    return this.textureLoader.load(bTexture.asset_file, (t) => {
      t.encoding = sRGBEncoding;
      t.anisotropy = 16;
      t.name = 'texture_' + bTexture.name;
    });
  }

  public refreshAvailableAssets() {
    if (this.availableTextures$$) {
      this.availableTextures$$.unsubscribe();
    }
    this.availableTextures$$ = this.fileService.getAvailableTextures().subscribe({
      next: (at) => {
        this.availableTextures$.next(at.verifiedTextures);
      },
      error: (err) => {
        console.error('Failed to request list of available textures. Fallback to static assets required.', err);
        this.availableTextures$.next([]);
      },
    });
    if (this.availableModels$$) {
      this.availableModels$$.unsubscribe();
    }
    this.availableModels$$ = this.fileService.getAvailableGltfs().subscribe({
      next: (ag) => {
        this.availableModels$.next(ag.verifiedGltfs);
      },
      error: (err) => {
        console.error('Failed to request list of available models. Fallback to static assets required.', err);
        this.availableModels$.next([]);
      },
    });
    if (this.availableCubeMaps$$) {
      this.availableCubeMaps$$.unsubscribe();
    }
    this.availableCubeMaps$$ = this.fileService.getAvailableCubeMaps().subscribe({
      next: (cms) => this.availableCubeMaps$.next(cms),
      error: (err) => {
        console.error('Failed to request list of available cube maps. Fallback to static assets required.', err);
        this.availableCubeMaps$.next([]);
      },
    });
  }

  public pathOf(fileCarryingObject: BackendTexture | BackendGltf): string {
    return this.basePath + fileCarryingObject.asset_file;
  }

  ngOnDestroy(): void {
    this.availableTextures$$.unsubscribe();
    this.availableModels$$.unsubscribe();
    this.availableCubeMaps$$.unsubscribe();
  }
}
