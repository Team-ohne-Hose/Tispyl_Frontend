import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {PerspectiveCamera, Renderer, Scene} from 'three';
import {MouseInteraction} from './helpers/MouseInteraction';
import {AudioControl} from './helpers/AudioControl';
import {BoardItemManagement} from './helpers/BoardItemManagement';
import {CameraControl} from './helpers/CameraControl';
import {SceneBuilderService} from '../../../services/scene-builder.service';
import {GameBoardOrbitControl} from './helpers/GameBoardOrbitControl';
import {ObjectLoaderService} from '../../../services/object-loader.service';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {ClickedTarget, PhysicsCommands} from './helpers/PhysicsCommands';
import {PhysicsEntity, PhysicsEntityVariation} from '../../../model/WsData';
import {BoardTilesService} from '../../../services/board-tiles.service';
import {GameStateService} from '../../../services/game-state.service';
import {ItemService} from '../../../services/item.service';

export class ObjectUserData {
  physicsId: number;
  entityType: PhysicsEntity;
  variation: PhysicsEntityVariation;
  clickRole: ClickedTarget;
}
@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.css']
})
export class ViewportComponent implements AfterViewInit, OnInit {

  mouseInteract: MouseInteraction;
  cameraControl: CameraControl;
  boardItemManager: BoardItemManagement;
  audioControl: AudioControl;
  stats: Stats;

  labelSpritesHidden = true;

  constructor(private sceneBuilder: SceneBuilderService,
              private objectLoaderService: ObjectLoaderService,
              private gameState: GameStateService,
              private boardTiles: BoardTilesService,
              public itemService: ItemService) {

  }

  @ViewChild('view') view: HTMLDivElement;
  @Output() registerViewport = new EventEmitter<[CameraControl, BoardItemManagement, AudioControl]>();

  // Utilities
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: Renderer;
  controls: GameBoardOrbitControl;
  physics: PhysicsCommands;

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.boardItemManager.updateSprites(this.labelSpritesHidden, this.scene);
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
  }

  ngOnInit() {
  }

  async ngAfterViewInit() {
    // disable scrollbars
    document.documentElement.setAttribute('style', 'overflow: hidden');
    const width = this.view['nativeElement'].offsetWidth;
    const height = this.view['nativeElement'].offsetHeight;

    // initialize Scene
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.Fog( this.scene.background.getHex(), 0.1, 5000 );

    // initialize Camera & Renderer
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    this.camera.position.set( 0, 70, -30 );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    const viewPortRenderer: HTMLCanvasElement = this.renderer.domElement;
    viewPortRenderer.setAttribute('style', viewPortRenderer.getAttribute('style') + 'display_name: block;');
    document.getElementById('viewport-container').appendChild( viewPortRenderer );

    // add Stats Overlay
    this.stats = Stats();
    document.getElementById('viewport-container').appendChild(this.stats.dom);


    const spotlight = this.sceneBuilder.generateSpotLight();
    this.scene.add(spotlight);

    // initialize Controls
    this.controls = this.sceneBuilder.generateGameBoardOrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = new THREE.Vector3(this.boardTiles.borderCoords.x[4], 5, this.boardTiles.borderCoords.y[4]);
    this.controls.update();

    // initialize Physics
    this.physics = new PhysicsCommands(this.objectLoaderService, this.gameState);
    this.physics.scene = this.scene;

    // initialize BoardItemManagement
    this.boardItemManager = new BoardItemManagement(this.scene, this.sceneBuilder, this.physics, this.gameState, this.objectLoaderService);

    // initialize Mouse
    this.mouseInteract = new MouseInteraction(this.camera, this.boardItemManager, this.physics, this.gameState, this.boardTiles, this.itemService);
    this.mouseInteract.updateScreenSize(width, height);

    // initialize Audio/Camera Control
    this.audioControl = new AudioControl();
    this.audioControl.initAudio(this.camera);
    this.cameraControl = new CameraControl(this.camera, this.controls);

    // register at Game Component
    this.registerViewport.emit([this.cameraControl, this.boardItemManager, this.audioControl]);

    console.info('THREE.js Viewport initialised');
  }
  initialiseScene() {
    // load stuff which is dependend on loading textures
    this.scene.background = this.objectLoaderService.getCubeMap();

    // Add environment(Gameboard) into Scene
    const gameBoard = this.objectLoaderService.generateGameBoard();
    this.scene.add(gameBoard);

    this.boardItemManager.board = gameBoard;
    this.mouseInteract.addInteractable(gameBoard);
  }
  startRendering() {
    this.animate();
    console.debug('THREE.js rendering started');
  }

  keyDown(event) {
    if (event.key === 'Tab') {
      this.labelSpritesHidden = false;
      event.preventDefault();
      event.stopPropagation();
    }
  }
  keyUp(event) {
    if (event.key === 'Tab') {
      this.labelSpritesHidden = true;
    }
  }

  onWindowResize(event) {
    console.debug('viewResizing: ', window.innerWidth, this.view['nativeElement'].clientWidth, this.view['nativeElement'].scrollWidth,
      this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight, this.view);
    this.renderer.setSize(this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight);
    this.camera.aspect = this.view['nativeElement'].offsetWidth / this.view['nativeElement'].offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight);
    this.mouseInteract.updateScreenSize(this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight);
  }
}
