import {Injectable} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GameBoardOrbitControl} from '../viewport/GameBoardOrbitControl';

@Injectable({
  providedIn: 'root'
})
export class SceneBuilderService {
  gameBoardTextureURL = '/assets/tischspiel.png';

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

  constructor() {
  }

  generateHemisphereLight(): { hemi: THREE.HemisphereLight, hemiHelp: THREE.HemisphereLightHelper } {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    return {hemi: hemiLight, hemiHelp: hemiLightHelper};
  }

  generateDirectionalLight(): { dir: THREE.DirectionalLight, dirHelp: THREE.DirectionalLightHelper } {
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    const dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 2500;
    dirLight.shadow.bias = -0.0001;

    return {dir: dirLight, dirHelp: dirLightHeper};
  }

  generateGround(): THREE.Mesh {
    const groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
    const groundMat = new THREE.MeshLambertMaterial({color: 0xffffff});
    const ground = new THREE.Mesh(groundGeo, groundMat);

    groundMat.color.setHSL(0.095, 1, 0.75);
    ground.position.y = -33;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    return ground;
  }

  generateSkyDome(topCol: THREE.Color, fog: THREE.IFog): THREE.Mesh {
    const uniforms = {
      'topColor': {value: new THREE.Color(0x0077ff)},
      'bottomColor': {value: new THREE.Color(0xffffff)},
      'offset': {value: 33},
      'exponent': {value: 0.6}
    };
    const skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    uniforms['topColor'].value.copy(topCol);
    fog.color.copy(uniforms['bottomColor'].value);

    return sky;
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

  generateOrbitControls(cam: THREE.Camera, domElem: HTMLElement): OrbitControls {
    const orbitCtrl = new OrbitControls(cam, domElem);
    orbitCtrl.enableDamping = true;
    orbitCtrl.enablePan = false;
    orbitCtrl.mouseButtons = {
      LEFT: undefined, // THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };
    return orbitCtrl;
  }

  generateGameBoard(): THREE.Mesh {
    const gameBoardGeo = new THREE.BoxGeometry(100, 1, 100);
    const gameBoardMat = new THREE.MeshPhysicalMaterial({color: 0xffffff});
    const gameBoard = new THREE.Mesh(gameBoardGeo, gameBoardMat);
    gameBoard.position.y = 0;
    gameBoard.castShadow = true;
    gameBoard.receiveShadow = true;
    gameBoard.name = 'gameboard';

    this.tLoader.load(this.gameBoardTextureURL, (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      gameBoardMat.map = texture;
      gameBoardMat.needsUpdate = true;
    }, undefined, (error) => {
      console.error(error);
    });
    return gameBoard;
  }

  generateGameFigure(color: number): THREE.Mesh {
    const gameFigureGeo = new THREE.CylinderGeometry(1.3, 1.5, 1, 20, 1);
    const gameFigureMat = new THREE.MeshPhysicalMaterial({color: color});
    const gameFigure = new THREE.Mesh(gameFigureGeo, gameFigureMat);
    gameFigure.receiveShadow = true;
    gameFigure.castShadow = true;
    gameFigure.name = 'gamefigure';

    return gameFigure;
  }
}
