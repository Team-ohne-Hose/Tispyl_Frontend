import { Texture, TextureLoader, sRGBEncoding } from 'three';

/**
 * This Store holds all asset access methods and definitions so that the object-loader
 * service can be kept clean of static definitions.
 */
export class AssetLoader {
  /** Loader objects */
  private static readonly textureLoader: TextureLoader = new TextureLoader();

  /** Available assets and asset paths */
  public static readonly defaultTileTexturePath: string = '/assets/board/default.png';
  public static readonly defaultGameboardTexturePath: string = '/assets/tischspiel_clear.png';

  /** Helper functions to make loader access cleaner */
  public static loadTexture(
    path: string,
    onLoad?: (texture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): Texture {
    //console.log('Loading texture: ', path);
    const _onLoad = (t: Texture) => {
      t.encoding = sRGBEncoding;
      t.anisotropy = 16;
      if (onLoad) {
        onLoad(t);
      }
    };
    const default_onError = (err: ErrorEvent) => {
      console.error(err);
    };
    return this.textureLoader.load(path, _onLoad, onProgress, onError || default_onError);
  }
}
