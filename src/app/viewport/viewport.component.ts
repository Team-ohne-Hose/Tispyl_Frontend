import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {AudioLoader, Camera, Renderer, Scene, TextureLoader} from 'three';

@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.css']
})
export class ViewportComponent implements AfterViewInit, OnInit {

  constructor() { }
  @ViewChild('view') view: HTMLDivElement;

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

  gameBoardTextureURL = '/assets/tischspiel.png';

  // Utilities
  scene: Scene;
  camera: Camera;
  renderer: Renderer;
  tLoader = new TextureLoader();

  // Lighting
  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLightHelper = new THREE.HemisphereLightHelper( this.hemiLight, 10 );
  dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLightHeper = new THREE.DirectionalLightHelper( this.dirLight, 10 );

  // Environment
  groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
  groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff} );
  ground = new THREE.Mesh( this.groundGeo, this.groundMat );
  uniforms = {
    'topColor': { value: new THREE.Color( 0x0077ff ) },
    'bottomColor': { value: new THREE.Color( 0xffffff ) },
    'offset': { value: 33 },
    'exponent': { value: 0.6 }
  };
  skyGeo = new THREE.SphereBufferGeometry( 4000, 32, 15 );
  skyMat = new THREE.ShaderMaterial( {
    uniforms: this.uniforms,
    vertexShader: this.vertexShader,
    fragmentShader: this.fragmentShader,
    side: THREE.BackSide
  });
  sky = new THREE.Mesh( this.skyGeo, this.skyMat );

  // Sound
  listener = new THREE.AudioListener();
  sound = new THREE.Audio(this.listener);
  audioLoader = new AudioLoader();

  // Board
  gameBoardGeo = new THREE.BoxGeometry(40, .2, 40);
  gameBoardMat = new THREE.MeshPhysicalMaterial( {color: 0xffffff});
  gameBoard = new THREE.Mesh(this.gameBoardGeo, this.gameBoardMat);

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);

    this.gameBoard.rotation.y += 0.002;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    document.getElementById('navBar_Test').setAttribute('style', 'display: none');
    console.log('viewSizing: ', this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight, this.view);
    this.initScene(this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight);
    this.loadTexture();
    this.initLighting();

    this.gameBoard.position.y = 0;
    this.gameBoard.castShadow = true;
    this.gameBoard.receiveShadow = true;
    this.scene.add(this.gameBoard);

    this.camera.position.set( 0, 10, 20 );
    this.camera.lookAt(0, 0, 10);

    // this.renderer.shadowMap.enabled = true;

    this.initAudio();
    this.animate();
  }

  onWindowResize(event) {
    console.log('viewResizing: ', window.innerWidth, this.view['nativeElement'].clientWidth, this.view['nativeElement'].scrollWidth, this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight, this.view);
    this.renderer.setSize(this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight);
    this.renderer.setSize(this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight);
  }

  initScene(width: number, height: number): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    const viewPortRenderer: HTMLCanvasElement = this.renderer.domElement;
    viewPortRenderer.setAttribute('style', viewPortRenderer.getAttribute('style') + 'display: block;');
    document.getElementById('viewport-container').appendChild( viewPortRenderer );

    this.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    this.scene.fog = new THREE.Fog( this.scene.background, 0.1, 5000 );
  }
  loadTexture(): void {
    this.tLoader.load(this.gameBoardTextureURL, (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      this.gameBoardMat.map = texture;
      this.gameBoardMat.needsUpdate = true;
    }, undefined, (error) => {
      console.error(error);
    });
  }
  initLighting(): void {
    this.hemiLight.color.setHSL( 0.6, 1, 0.6 );
    this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    this.hemiLight.position.set( 0, 50, 0 );

    this.scene.add( this.hemiLight );
    this.scene.add( this.hemiLightHelper );

    this.dirLight.color.setHSL( 0.1, 1, 0.95 );
    this.dirLight.position.set( - 1, 1.75, 1 );
    this.dirLight.position.multiplyScalar( 30 );


    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;

    // TODO
    const d = 50;
    this.dirLight.shadow.camera.left = - d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = - d;

    this.dirLight.shadow.camera.far = 2500;
    this.dirLight.shadow.bias = - 0.0001;

    this.scene.add( this.dirLight );
    this.scene.add( this.dirLightHeper );

    // GROUND

    this.groundMat.color.setHSL( 0.095, 1, 0.75 );
    this.ground.position.y = - 33;
    this.ground.rotation.x = - Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add( this.ground );

    // SKYDOME

    this.uniforms[ 'topColor' ].value.copy( this.hemiLight.color );
    this.scene.fog.color.copy( this.uniforms[ 'bottomColor' ].value );
    this.scene.add( this.sky );
  }

  initAudio(): void {
    this.camera.add(this.listener);
    this.audioLoader.load('/assets/ourAnthem.ogg', (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setLoop(true);
      this.sound.setVolume(0.5);
    });
  }
  startAnthem() {
    this.sound.play();
  }
}
