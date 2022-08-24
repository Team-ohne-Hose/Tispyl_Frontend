import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Scene, PerspectiveCamera, WebGLRenderer, Object3D, DirectionalLight, AmbientLight, Vector3 } from 'three';
import { UserInteractionController } from './helpers/UserInteractionController';
import { ObjectLoaderService } from '../../../services/object-loader/object-loader.service';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { ClickedTarget } from './helpers/PhysicsCommands';
import { PhysicsEntity, PhysicsEntityVariation } from '../../../model/WsData';
import { BoardTilesService } from '../../../services/board-tiles.service';
import { GameStateService } from '../../../services/game-state.service';
import { ItemService } from '../../../services/items-service/item.service';
import { BoardItemControlService } from '../../../services/board-item-control.service';
import { Observable, Observer } from 'rxjs';
import { Progress } from '../../../services/object-loader/loaderTypes';
import { GameSettingsService } from 'src/app/services/game-settings.service';

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
    private bic: BoardItemControlService,
    private gss: GameSettingsService
  ) {
    // this.stats = Stats(); TODO: Reintroduce this in the game options
  }

  async ngAfterViewInit(): Promise<void> {
    const width = this.view.nativeElement.offsetWidth;
    const height = this.view.nativeElement.offsetHeight;

    /** Construct an empty scene */
    this.sceneTree = new Scene();
    this.camera = new PerspectiveCamera();
    this.renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.view.nativeElement.append(this.renderer.domElement);

    /** Bind viewport to its control objects */
    this.bic.bind(this);
    this.userInteractionController = new UserInteractionController(this.bic, this.gss);

    console.debug('THREE.js "empty" viewport constructed');
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
    // this.stats.update(); TODO: Reintroduce this in the game options
  }

  initializeScene(): Observable<Progress> {
    return new Observable<Progress>((o: Observer<Progress>) => {
      this._initializeScene(o);
      o.complete();
    });
  }

  private _initializeScene(o: Observer<Progress>): void {
    o.next([0, 4]);
    const width = this.view.nativeElement.offsetWidth;
    const height = this.view.nativeElement.offsetHeight;

    /** Finalize userInteraction initialization */
    this.userInteractionController.mouseInteractions.updateScreenSize(width, height);
    this.userInteractionController.cameraControls.target = new Vector3(
      this.boardTiles.borderCoords.x[4],
      5,
      this.boardTiles.borderCoords.y[4]
    );
    this.userInteractionController.cameraControls.update();
    o.next([1, 4]);

    /** Configure basic objects */
    this.camera.fov = 75;
    this.camera.aspect = width / height;
    this.camera.near = 0.1;
    this.camera.far = 5000;
    this.camera.position.set(0, 70, -30);
    this.camera.updateProjectionMatrix();

    /** Lighting - NOTE: this setup is tailored specifically to the current object materials and is far off from any physical model */
    const ambient = new AmbientLight(0xb1e1ff, 0.8); // soft blue-ish ambient light
    const sun = new DirectionalLight(0xf7eee4, 4.5); // warm yellow-ish sun light
    const sunTarget = new Object3D().translateY(5);
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
    o.next([2, 4]);

    /** Load texture objects that require heavy operations */
    this.sceneTree.background = this.objectLoaderService.getCubeMap(); // sky box
    o.next([3, 4]);
    const gameBoard = this.objectLoaderService.generateGameBoard(); // game board
    this.sceneTree.add(gameBoard);

    /** Keep references */
    this.bic.board = gameBoard;
    this.userInteractionController.mouseInteractions.addInteractable(gameBoard);
    o.next([4, 4]);
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
