import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {Mesh, Object3D, PerspectiveCamera, Renderer, Scene} from 'three';
import {MouseInteraction} from './MouseInteraction';
import {AudioControl} from './AudioControl';
import {BoardItemManagement} from './BoardItemManagement';
import {CameraControl} from './CameraControl';
import {SceneBuilderService} from '../../services/scene-builder.service';
import {GameBoardOrbitControl} from './GameBoardOrbitControl';
import {BoardCoordConversion} from './BoardCoordConversion';
import {ObjectLoaderService} from '../../services/object-loader.service';
import Stats from 'THREE/examples/jsm/libs/stats.module.js';
import {PhysicsCommands} from './PhysicsCommands';
import {ColyseusClientService} from '../../services/colyseus-client.service';

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

  constructor(private sceneBuilder: SceneBuilderService, private objectLoaderService: ObjectLoaderService, private colyseus: ColyseusClientService) {  }

  @ViewChild('view') view: HTMLDivElement;
  @Output() registerViewport = new EventEmitter<[CameraControl, BoardItemManagement, AudioControl]>();

  // Utilities
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: Renderer;
  controls: GameBoardOrbitControl;
  physics: PhysicsCommands;

  static getObjectByPhysId(toSearch: Object3D, physId: number): THREE.Object3D {
    // console.log('searching for ' + physId + ' in: ', toSearch.name, toSearch.userData.physId, toSearch.userData, toSearch);
    if (toSearch.userData.physId === physId) {
      return toSearch;
    } else {
      toSearch.children.forEach((obj: THREE.Object3D, index: number) => {
        const res = ViewportComponent.getObjectByPhysId(obj, physId);
        if (res !== undefined) {
          return res;
        }
      });
      return undefined;
    }
  }
  static getPhysId(obj: Object3D): number {
    return obj.userData.physId;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    // this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.boardItemManager.removeToDelete();
    this.stats.update();
  }

  ngOnInit() {
  }

  async ngAfterViewInit() {
    // disable scrollbars
    document.documentElement.setAttribute('style', 'overflow: hidden');
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
    this.stats = Stats();
    document.getElementById('viewport-container').appendChild(this.stats.dom);

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
    this.physics = new PhysicsCommands(this.colyseus);
    this.physics.disposeFromViewport = this.disposeFromViewport.bind(this);
    this.physics.scene = this.scene;
    this.boardItemManager = new BoardItemManagement(this.scene, this.sceneBuilder, this.physics, this.colyseus);
    this.boardItemManager.board = gameBoard;
    this.mouseInteract = new MouseInteraction(this.scene, this.camera, this.boardItemManager, this.physics);
    this.mouseInteract.updateScreenSize(width, height);

    this.physics.addMesh('test1', gameBoard, 0, physId => {
      this.physics.setKinematic(physId, true);
    });
    /* await new Promise(resolve => {
      setTimeout(resolve, 1000);
    }); */
    this.colyseus.getActiveRoom().subscribe((room) => {
      this.boardItemManager.loadGameFigure(room.sessionId, Math.random() * 0xffffff);
    });

    this.objectLoaderService.loadObject(ObjectLoaderService.LoadableObject.dice2, (model: Object3D) => {
      model.position.set(2, 2, 0);
      const myModel = model.children[0] as Mesh;
      this.scene.add(myModel);
      // this.scene.add(model.children[1]);
      this.physics.addMesh('', myModel, 1);
      /* TODO: redo onDelete
      (obj) => {
        this.physics.setPosition(myModel, 0, 10, 0);
        return true;
      });
       */
      this.boardItemManager.dice = myModel;
    });

    this.audioControl.initAudio(this.camera);
    this.registerViewport.emit([this.cameraControl, this.boardItemManager, this.audioControl]);
    this.animate();
  }

  disposeFromViewport(id: number) {
    this.scene.remove(this.scene.getObjectById(id));
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
