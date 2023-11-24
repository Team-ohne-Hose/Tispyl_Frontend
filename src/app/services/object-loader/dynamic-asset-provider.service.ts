import { Injectable, OnDestroy } from '@angular/core';
import { BackendCubeMap, BackendGltf, BackendTexture, FileService } from '../file.service';
import { Observable, Observer, ReplaySubject, Subscription, take } from 'rxjs';
import { CubeTexture, Object3D, Texture, TextureLoader, sRGBEncoding } from 'three';
import { map, mergeMap } from 'rxjs/operators';
import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { environment } from '../../../environments/environment';

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

  constructor(private fileService: FileService) {
    this.gltfLoader.setPath(this.basePath);
    this.textureLoader.setPath(this.basePath);
    this.cubeTextureLoader.setPath(this.basePath);
    this.refreshAvailableAssets();
  }

  public loadGltfByName(name: string): Observable<Object3D> {
    return this.availableModels$.pipe(
      take(1),
      mergeMap((gltfs) => {
        const gltf = gltfs.find((g) => g.name === name);
        if (gltf) {
          console.debug(`Loading gltf, name: ${name} object:`, gltf);
          return this._loadGltf(gltf);
        }
        throw Error(`Could not find gltf with the name: ${name}`);
      })
    );
  }

  public loadGltf(id: number): Observable<Object3D> {
    return this.availableModels$.pipe(
      take(1),
      mergeMap((bGltfs) => {
        console.debug(`Loading gltf, id:${id} object:`, bGltfs[id]);
        return this._loadGltf(bGltfs[id]);
      })
    );
  }

  private _loadGltf(bGltf: BackendGltf): Observable<Object3D> {
    return new Observable<Object3D>((o: Observer<Object3D>) => {
      this.gltfLoader.load(bGltf.asset_file, (g) => {
        g.scene.name = 'gltf_' + bGltf.name;
        g.scene.castShadow = true;
        g.scene.receiveShadow = true;
        g.scene.children.forEach((o3d) => {
          o3d.castShadow = true;
        });
        o.next(g.scene);
        o.complete();
      });
    });
  }

  public loadCubeMap(id: number): Observable<CubeTexture> {
    return this.availableCubeMaps$.pipe(
      take(1),
      map((bCubeMaps) => {
        console.debug(`Loading cube map, id:${id} object: ${bCubeMaps[id]}`);
        const bCubeMap = bCubeMaps[id];
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
      })
    );
  }

  public loadTexture(id: number): Observable<Texture> {
    return this.availableTextures$.pipe(
      take(1),
      map((bTextures) => {
        console.debug(`Loading texture, id:${id} object: ${bTextures[id]}`);
        const bTexture = bTextures[id];
        return this.textureLoader.load(bTexture.asset_file, (t) => {
          t.encoding = sRGBEncoding;
          t.anisotropy = 16;
          t.name = 'texture_' + bTexture.name;
        });
      })
    );
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

  ngOnDestroy(): void {
    this.availableTextures$$.unsubscribe();
    this.availableModels$$.unsubscribe();
    this.availableCubeMaps$$.unsubscribe();
  }
}
