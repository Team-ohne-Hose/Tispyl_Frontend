import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {PerspectiveCamera, Renderer, Scene} from 'three';
import {MouseInteraction} from './MouseInteraction';
import {AudioControl} from './AudioControl';
import {BoardItemManagment} from './BoardItemManagment';
import {CameraControl} from './CameraControl';
import {SceneBuilderService} from '../services/scene-builder.service';
import {GameBoardOrbitControl} from './GameBoardOrbitControl';
import {BoardCoordConversion} from './BoardCoordConversion';
import {ObjectLoaderService} from '../object-loader.service';

@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.css']
})
export class ViewportComponent implements AfterViewInit, OnInit {

  mouseInteract: MouseInteraction;
  cameraControl: CameraControl;
  boardItemManager: BoardItemManagment;
  audioControl: AudioControl;

  constructor(private sceneBuilder: SceneBuilderService, private objectLoaderService: ObjectLoaderService) {  }

  @ViewChild('view') view: HTMLDivElement;
  @Output() registerViewport = new EventEmitter<[CameraControl, BoardItemManagment, AudioControl]>();

  // Utilities
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: Renderer;
  controls: GameBoardOrbitControl;

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    // this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.boardItemManager.removeToDelete();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // disable navBar
    document.getElementById('navBar_Test').setAttribute('style', 'display_name: none');
    const width = this.view['nativeElement'].offsetWidth;
    const height = this.view['nativeElement'].offsetHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    this.scene.fog = new THREE.Fog( this.scene.background.getHex(), 0.1, 5000 );

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });

    this.renderer.setSize(width, height);

    const viewPortRenderer: HTMLCanvasElement = this.renderer.domElement;
    viewPortRenderer.setAttribute('style', viewPortRenderer.getAttribute('style') + 'display_name: block;');
    document.getElementById('viewport-container').appendChild( viewPortRenderer );

    // Add environment into Scene
    const hemi = this.sceneBuilder.generateHemisphereLight();
    this.scene.add( hemi.hemi );
    this.scene.add( hemi.hemiHelp );

    const dir = this.sceneBuilder.generateDirectionalLight();
    this.scene.add( dir.dir );
    this.scene.add( dir.dirHelp );

    this.scene.add(this.sceneBuilder.generateGround());

    this.scene.add(this.sceneBuilder.generateSkyDome(hemi.hemi.color, this.scene.fog));

    const gameBoard = this.sceneBuilder.generateGameBoard();
    this.scene.add(gameBoard);


    this.controls = this.sceneBuilder.generateGameBoardOrbitControls(this.camera, this.renderer.domElement);


    this.controls.target = new THREE.Vector3(BoardCoordConversion.borderCoords.x[4], 5, BoardCoordConversion.borderCoords.y[4]);
    this.camera.position.set( 0, 70, -30 );
    this.controls.update();

    this.audioControl = new AudioControl();
    this.cameraControl = new CameraControl(this.camera, this.controls);
    this.boardItemManager = new BoardItemManagment(this.scene, this.sceneBuilder);
    this.boardItemManager.board = gameBoard;
    this.mouseInteract = new MouseInteraction(this.scene, this.camera, this.boardItemManager);
    this.mouseInteract.updateScreenSize(width, height);

    this.boardItemManager.addMarker(BoardCoordConversion.borderCoords.x[4], 0, BoardCoordConversion.borderCoords.y[4], 0x5d00ff);
    this.boardItemManager.addGameFigure();

    this.objectLoaderService.loadObject(ObjectLoaderService.LoadableObject.dice, (model: THREE.Group) => {
      model.position.set(0, 2, 0);
      model.scale.set(0.5, 0.5, 0.5);
      this.scene.add(model);
    });
    this.objectLoaderService.loadObject(ObjectLoaderService.LoadableObject.dice2, (model: THREE.Group) => {
      model.position.set(2, 2, 0);
      this.scene.add(model);
    });

    this.audioControl.initAudio(this.camera);
    this.registerViewport.emit([this.cameraControl, this.boardItemManager, this.audioControl]);
    this.animate();
  }

  onWindowResize(event) {
    console.log('viewResizing: ', window.innerWidth, this.view['nativeElement'].clientWidth, this.view['nativeElement'].scrollWidth,
      this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight, this.view);
    this.renderer.setSize(this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight);
    this.camera.aspect = this.view['nativeElement'].offsetWidth / this.view['nativeElement'].offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight);
    this.mouseInteract.updateScreenSize(this.view['nativeElement'].offsetWidth, this.view['nativeElement'].offsetHeight);
  }
}
