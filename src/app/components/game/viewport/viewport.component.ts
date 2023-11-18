import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { UserInteractionController } from './helpers/UserInteractionController';
import { ObjectLoaderService } from '../../../services/object-loader/object-loader.service';
import { ClickRole } from './helpers/PhysicsCommands';
import { PhysicsEntity, PhysicsEntityVariation } from '../../../model/WsData';
import { BoardTilesService } from '../../../services/board-tiles.service';
import { ItemService } from '../../../services/items-service/item.service';
import { BoardItemControlService } from '../../../services/board-item-control.service';
import { Observable, Observer } from 'rxjs';
import { Progress } from '../../../services/object-loader/loaderTypes';
import { GameSettingsService } from 'src/app/services/game-settings.service';
import { PredefinedObjectGenerator } from '../../../services/object-loader/predefined-object-generator';

export class ObjectUserData {
  physicsId: number;
  entityType: PhysicsEntity;
  variation: PhysicsEntityVariation;
  clickRole: ClickRole;
}

/**
 * Wraps the SceneTree into a slim component.
 */
@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.css'],
})
export class ViewportComponent implements AfterViewInit, OnDestroy {
  @ViewChild('view') view: ElementRef;
  userInteractionController: UserInteractionController;
  sceneTree: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;

  private t0: DOMHighResTimeStamp = -1;
  private t1: DOMHighResTimeStamp = -1;
  public dt: DOMHighResTimeStamp = -1;
  public fps = -1;

  constructor(
    private objectLoaderService: ObjectLoaderService,
    private boardTiles: BoardTilesService,
    public itemService: ItemService,
    private bic: BoardItemControlService,
    private gss: GameSettingsService
  ) {}

  ngOnDestroy(): void {
    this.stopRendering();
    this.userInteractionController.onDestroy();
    this.objectLoaderService.disassembleScene(this.sceneTree);
    this.renderer.dispose();
    this.renderer.info.reset();
  }

  async ngAfterViewInit(): Promise<void> {
    const width = this.view.nativeElement.offsetWidth;
    const height = this.view.nativeElement.offsetHeight;

    /** Construct an empty scene */
    this.sceneTree = new Scene();
    this.camera = new PerspectiveCamera();
    this.renderer = new WebGLRenderer({ antialias: true });
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
    console.debug('THREE.js rendering started');
    // The XRFrame contains VR and AR pose information and can be ignored
    this.renderer.setAnimationLoop((ts: DOMHighResTimeStamp, _: XRFrame) => {
      this.t1 = ts;
      this.dt = this.t1 - this.t0;
      this.fps = 1000 / this.dt;
      this.renderer.render(this.sceneTree, this.camera);
      this.userInteractionController.cameraControls.update();
      this.t0 = this.t1;
    });
  }

  stopRendering() {
    this.renderer.setAnimationLoop(null);
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
    const ambient = PredefinedObjectGenerator.generateAmbientLight();
    this.sceneTree.add(ambient);
    const sun = PredefinedObjectGenerator.generateDirectionalLight();
    this.sceneTree.add(sun);
    o.next([2, 4]);

    /** Load texture objects that require heavy operations */
    this.objectLoaderService.getCubeMap(1).subscribe((suc) => {
      this.sceneTree.background = suc;
    });
    // This does not represent the correct state of loading the skybox anymore
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
