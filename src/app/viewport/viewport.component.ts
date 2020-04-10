import {AfterViewInit, Component, EventEmitter, HostListener, OnInit, Output, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {AudioLoader, Camera, PerspectiveCamera, Renderer, Scene, TextureLoader, Vector2} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {MouseInteraction} from './MouseInteraction';
import {AudioControl} from './AudioControl';
import {BoardItemManagment} from './BoardItemManagment';
import {CameraControl} from './CameraControl';
import {SceneBuilderService} from '../scene-builder.service';

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

  constructor(private sceneBuilder: SceneBuilderService) {  }

  @ViewChild('view') view: HTMLDivElement;
  @Output() registerViewport = new EventEmitter<[CameraControl, BoardItemManagment, AudioControl]>();

  // Utilities
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: Renderer;
  controls: OrbitControls;

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
    document.getElementById('navBar_Test').setAttribute('style', 'display: none');
    const width = this.view['nativeElement'].offsetWidth;
    const height = this.view['nativeElement'].offsetHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    this.scene.fog = new THREE.Fog( this.scene.background.getHex(), 0.1, 5000 );

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(width, height);

    const viewPortRenderer: HTMLCanvasElement = this.renderer.domElement;
    viewPortRenderer.setAttribute('style', viewPortRenderer.getAttribute('style') + 'display: block;');
    document.getElementById('viewport-container').appendChild( viewPortRenderer );

    this.camera.position.set( 0, 50, 0 );
    this.camera.lookAt(10, 10, -10);

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


    this.controls = this.sceneBuilder.generateOrbitControls(this.camera, this.renderer.domElement);

    this.audioControl = new AudioControl();
    this.cameraControl = new CameraControl(this.camera);
    this.boardItemManager = new BoardItemManagment(this.scene);
    this.boardItemManager.board = gameBoard;
    this.mouseInteract = new MouseInteraction(this.scene, this.camera, this.boardItemManager);
    this.mouseInteract.updateScreenSize(width, height);

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
