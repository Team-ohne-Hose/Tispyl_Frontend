import { CubeMap, DiceVariations, FigureVariations, PlayerModelData, ResourceData } from './loaderTypes';
import { PlayerModel } from '../../model/WsData';
import { CubeTexture, Texture, TextureLoader, sRGBEncoding } from 'three';
import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * This Store holds all asset access methods and definitions so that the object-loader
 * service can be kept clean of static definitions.
 */
export class AssetLoader {
  /** Loader objects */
  private static readonly textureLoader: TextureLoader = new TextureLoader();
  private static readonly cubeTextureLoader: CubeTextureLoader = new CubeTextureLoader();
  private static readonly gltfLoader: GLTFLoader = new GLTFLoader();

  /** Available assets and asset paths */
  private static readonly gltfBasePath: string = '/assets/models/';
  public static readonly defaultTileTexturePath: string = '/assets/board/default.png';
  public static readonly defaultGameboardTexturePath: string = '/assets/tischspiel_clear.png';
  public static cubeMaps: CubeMap[] = [
    new CubeMap('Ryfjallet', '/assets/cubemaps/mountain-skyboxes/Ryfjallet/'),
    new CubeMap('Maskonaive1', '/assets/cubemaps/mountain-skyboxes/Maskonaive/'),
    new CubeMap('Maskonaive2', '/assets/cubemaps/mountain-skyboxes/Maskonaive2/'),
    new CubeMap('Maskonaive3', '/assets/cubemaps/mountain-skyboxes/Maskonaive3/'),
    new CubeMap('Nalovardo', '/assets/cubemaps/mountain-skyboxes/Nalovardo/'),
    new CubeMap('Teide', '/assets/cubemaps/mountain-skyboxes/Teide/'),
    new CubeMap('ForbiddenCity', '/assets/cubemaps/urban-skyboxes/ForbiddenCity/'),
    new CubeMap('GamlaStan', '/assets/cubemaps/urban-skyboxes/GamlaStan/'),
    new CubeMap('Medborgarplatsen', '/assets/cubemaps/urban-skyboxes/Medborgarplatsen/'),
    new CubeMap('Roundabout', '/assets/cubemaps/urban-skyboxes/Roundabout/'),
    new CubeMap('SaintLazarusChurch', '/assets/cubemaps/urban-skyboxes/SaintLazarusChurch/'),
    new CubeMap('SaintLazarusChurch2', '/assets/cubemaps/urban-skyboxes/SaintLazarusChurch2/'),
    new CubeMap('SaintLazarusChurch3', '/assets/cubemaps/urban-skyboxes/SaintLazarusChurch3/'),
    new CubeMap('UnionSquare', '/assets/cubemaps/urban-skyboxes/UnionSquare/'),
    new CubeMap('Bridge', '/assets/cubemaps/bridge-skyboxes/Bridge/'),
    new CubeMap('Bridge2', '/assets/cubemaps/bridge-skyboxes/Bridge2/'),
  ];

  public static readonly playerModels: Map<PlayerModel, PlayerModelData> = new Map<PlayerModel, PlayerModelData>([
    [PlayerModel.bcap_NukaCola, new PlayerModelData('default')],
    [PlayerModel.bcap_CocaCola, new PlayerModelData('cocaCola')],
    [PlayerModel.bcap_Developer, new PlayerModelData('dev')],
    [PlayerModel.bcap_Jagermeister, new PlayerModelData('jagermeister')],
    [PlayerModel.bcap_Murica, new PlayerModelData('murica')],
    [PlayerModel.bcap_hb, new PlayerModelData('hb')],
    [PlayerModel.bcap_OurAnthem, new PlayerModelData('ourAnthem')],
    [PlayerModel.bcap_Schmucker, new PlayerModelData('schmucker')],
    [PlayerModel.bcap_Tiddies1, new PlayerModelData('kronkorken1')],
    [PlayerModel.bcap_cat, new PlayerModelData('catGoblin')],
    [PlayerModel.bcap_yoshi, new PlayerModelData('yoshi')],
    [PlayerModel.bcap_niclas, new PlayerModelData('Niclas_Kronkorken')],
    [PlayerModel.bcap_adi, new PlayerModelData('Adis_kronkorken')],
    [PlayerModel.bcap_countcount, new PlayerModelData('countcount')],
    [PlayerModel.bcap_gude, new PlayerModelData('gude')],
    [PlayerModel.bcap_lordHelmchen, new PlayerModelData('lord_helmchen')],
    [PlayerModel.bcap_skovald, new PlayerModelData('skovald', 'skovald_spec')],
  ]);

  public static readonly playerModelThumbnailPath = '../assets/models/otherTex/';
  public static readonly availableDice: DiceVariations<ResourceData> = {
    default: {
      cname: 'diceDefault',
      fname: 'diceDefault.glb',
      objectCache: undefined,
    },
    dice: {
      cname: 'diceModel',
      fname: 'dice/scene.gltf',
      objectCache: undefined,
    },
    dice2: {
      cname: 'diceModel2',
      fname: 'dice2/scene.gltf',
      objectCache: undefined,
    },
  };

  public static readonly availableFigures: FigureVariations<ResourceData> = {
    default: {
      cname: 'figureDefault',
      fname: 'figureDefault.glb',
      objectCache: undefined,
    },
  };

  /** Helper functions to make loader access cleaner */
  public static loadTexture(
    path: string,
    onLoad?: (texture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): Texture {
    console.log('Loading texture: ', path);
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

  public static loadCubeTexture(idx: number): CubeTexture {
    console.log('Loading cube texture: ', idx);
    return this.cubeTextureLoader
      .setPath(this.cubeMaps[idx].path)
      .load([
        this.cubeMaps[idx].px,
        this.cubeMaps[idx].nx,
        this.cubeMaps[idx].py,
        this.cubeMaps[idx].ny,
        this.cubeMaps[idx].pz,
        this.cubeMaps[idx].nz,
      ]);
  }

  public static loadGLTF(
    url: string,
    onLoad: (gltf: GLTF) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): void {
    console.log('Loading GLTF: ', url);
    this.gltfLoader.setPath(this.gltfBasePath).load(url, onLoad, onProgress, onError);
  }
}
