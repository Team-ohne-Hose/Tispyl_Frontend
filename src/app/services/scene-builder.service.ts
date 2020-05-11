import {Injectable} from '@angular/core';
import * as THREE from 'three';
import {GameBoardOrbitControl} from '../game/viewport/GameBoardOrbitControl';

@Injectable({
  providedIn: 'root'
})
export class SceneBuilderService {
  gameBoardTextureURL = '/assets/tischspiel_clear.png';

  vertexShader = `varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`;
  fragmentShader = `uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;

    void main() {
      float h = normalize( vWorldPosition + offset ).y;
      gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
    }`;

  tLoader = new THREE.TextureLoader();


  private gameBoardGeo = new THREE.BoxBufferGeometry(100, 1, 100);

  private gameBoardMat = new THREE.MeshStandardMaterial({color: 0xffffff});

  constructor() {
  }

  setEnvMaps(envMap: THREE.CubeTexture) {
    this.gameBoardMat.envMap = envMap;
    this.gameBoardMat.needsUpdate = true;
  }

  generateSpotLight(): THREE.SpotLight {
    const light = new THREE.SpotLight(0xffffff, 9, 0, 0.7, 0.45, 0.02);
    light.position.set(-60, 50, -90);


    return light;
  }
  generateGameBoardOrbitControls(cam: THREE.PerspectiveCamera, domElem: HTMLElement): GameBoardOrbitControl {
    const orbitCtrl = new GameBoardOrbitControl(cam, domElem);
    orbitCtrl.enablePan = false;
    orbitCtrl.mouseButtons = {
      LEFT: undefined, // THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };
    orbitCtrl.dollyMinAngle = Math.PI * 0.48;
    orbitCtrl.dollyMaxAngle = Math.PI * 0.2;
    orbitCtrl.dollyCurvature = 1;
    orbitCtrl.useDollyAngle = true;
    orbitCtrl.minDistance = 10;
    orbitCtrl.maxDistance = 100;
    orbitCtrl.enableTargetOffset = true;
    orbitCtrl.targetOffsetRatio = 25;
    orbitCtrl.minTargetOffset = 0;
    orbitCtrl.maxTargetOffset = 55;


    orbitCtrl.update();
    return orbitCtrl;
  }
  generateGameBoard(): THREE.Mesh {
    const gameBoard = new THREE.Mesh(this.gameBoardGeo, this.gameBoardMat);
    gameBoard.position.y = -.1;
    gameBoard.castShadow = false;
    gameBoard.receiveShadow = true;
    gameBoard.name = 'gameboard';
    this.gameBoardMat.roughness = .4;

    this.tLoader.load(this.gameBoardTextureURL, (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = 16;
      this.gameBoardMat.map = texture;
      this.gameBoardMat.needsUpdate = true;
    }, undefined, (error) => {
      console.error(error);
    });
    return gameBoard;
  }
}
