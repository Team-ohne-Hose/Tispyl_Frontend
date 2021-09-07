import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { PerspectiveCamera, Renderer, Scene, Vector3, WebGLRenderer } from 'three';
import { UserInteractionController } from './helpers/UserInteractionController';
import { ObjectLoaderService } from '../../../services/object-loader.service';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { ClickedTarget } from './helpers/PhysicsCommands';
import { PhysicsEntity, PhysicsEntityVariation } from '../../../model/WsData';
import { BoardTilesService } from '../../../services/board-tiles.service';
import { GameStateService } from '../../../services/game-state.service';
import { ItemService } from '../../../services/items-service/item.service';
import { BoardItemControlService } from '../../../services/board-item-control.service';

export class ObjectUserData {
  physicsId: number;
  entityType: PhysicsEntity;
  variation: PhysicsEntityVariation;
  clickRole: ClickedTarget;
}

/**
 * Wraps the SceneTree into a slim component.
 */
@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.css'],
})
export class ViewportComponent implements AfterViewInit {
  @ViewChild('view') view: ElementRef;
  userInteractionController: UserInteractionController;
  sceneTree: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;

  stats: Stats; // will be toggleable in a menu later on

  constructor(
    private objectLoaderService: ObjectLoaderService,
    private gameState: GameStateService,
    private boardTiles: BoardTilesService,
    public itemService: ItemService,
    private bic: BoardItemControlService
  ) {
    // this.stats = Stats();
  }

  async ngAfterViewInit(): Promise<void> {
    const width = this.view.nativeElement.offsetWidth;
    const height = this.view.nativeElement.offsetHeight;

    /** Construct an empty scene */
    this.sceneTree = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.view.nativeElement.append(this.renderer.domElement);

    /** Bind viewport to its control objects */
    this.bic.bind(this);
    this.userInteractionController = new UserInteractionController(this.bic);

    console.info('THREE.js "empty" viewport constructed');
  }

  startRendering(): void {
    this.userInteractionController.cameraControls.update(true);
    this.animate();
    console.debug('THREE.js rendering started');
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    this.renderer.render(this.sceneTree, this.camera);
    this.userInteractionController.cameraControls.update();
    // this.stats.update();
  }

  initializeScene(): void {
    const width = this.view.nativeElement.offsetWidth;
    const height = this.view.nativeElement.offsetHeight;

    /** Finalize userInteraction initialization */
    this.userInteractionController.mouseInteractions.updateScreenSize(width, height);
    this.userInteractionController.cameraControls.target = new THREE.Vector3(
      this.boardTiles.borderCoords.x[4],
      5,
      this.boardTiles.borderCoords.y[4]
    );
    this.userInteractionController.cameraControls.update();

    /** Configure basic objects */
    this.camera.fov = 75;
    this.camera.aspect = width / height;
    this.camera.near = 0.1;
    this.camera.far = 5000;
    this.camera.position.set(0, 70, -30);
    this.camera.updateProjectionMatrix();

    /** Lighting - NOTE: this setup is tailored specifically to the current object materials and is far off from any physical model */
    const ambient = new THREE.AmbientLight(0xb1e1ff, 0.8); // soft blue-ish ambient light
    const sun = new THREE.DirectionalLight(0xf7eee4, 4.5); // warm yellow-ish sun light
    const sunTarget = new THREE.Object3D().translateY(5);
    sun.position.set(20, 100, 90);
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;
    sun.shadow.bias = -0.00015;
    sun.target = sunTarget;
    sun.castShadow = true;

    this.sceneTree.add(ambient);
    this.sceneTree.add(sun);

    /** Load texture objects that require heavy operations */
    this.sceneTree.background = this.objectLoaderService.getCubeMap(); // sky box
    const gameBoard = this.objectLoaderService.generateGameBoard(); // game board
    this.sceneTree.add(gameBoard);

    /** Keep references */
    this.bic.board = gameBoard;
    this.userInteractionController.mouseInteractions.addInteractable(gameBoard);
  }

  keyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.bic.hideNameTags(false);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  keyUp(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.bic.hideNameTags(true);
    }
  }

  onWindowResize(_: Event): void {
    const w = this.view.nativeElement.offsetWidth;
    const h = this.view.nativeElement.offsetHeight;

    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.userInteractionController.mouseInteractions.updateScreenSize(w, h);
  }
}
