import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { PhysicsCommands } from '../components/game/viewport/helpers/PhysicsCommands';
import { GameStateService } from './game-state.service';
import { ObjectLoaderService } from './object-loader/object-loader.service';
import { BoardTilesService } from './board-tiles.service';
import { ItemService } from './items-service/item.service';
import { ViewportComponent } from '../components/game/viewport/viewport.component';
import {
  ConeBufferGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SphereBufferGeometry,
  Sprite,
  Vector3,
} from 'three';
import { Player } from '../model/state/Player';
import { GameActionType, GameSetTile, MessageType } from '../model/WsData';
import { Observable, Observer, Subscription, take } from 'rxjs';
import { Progress } from './object-loader/loaderTypes';
import { GameSettingsService } from './game-settings.service';

export interface FigureItem {
  mesh: Object3D;
  labelSprite: Sprite;
  name: string;
  isHidden: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BoardItemControlService implements OnInit, OnDestroy {
  rendererDomReference: HTMLCanvasElement;
  sceneTree: Scene;
  camera: PerspectiveCamera;

  physics: PhysicsCommands;

  allFigures: FigureItem[];
  board: Mesh;
  markerGeo = new ConeBufferGeometry(1, 10, 15, 1, false, 0, 2 * Math.PI);

  // subscriptions
  private persistentNamePlates$$: Subscription;
  private playerChange$$: Subscription;

  constructor(
    public gameState: GameStateService,
    public loader: ObjectLoaderService,
    public boardTiles: BoardTilesService,
    public itemService: ItemService,
    private gses: GameSettingsService
  ) {
    this.physics = new PhysicsCommands(this);

    this.allFigures = [];

    this.physics.addPlayer = ((mesh: Object3D, name: string) => {
      const figure = { mesh: mesh, labelSprite: undefined, name: name, isHidden: false };
      this.generatePlayerSprite(figure);
      this.allFigures.push(figure);
      console.debug('adding to BoardItemManagement´s list of figures', name, mesh, this.allFigures);

      // add label into scene if nametags are shown
      if (this.gses.persistentNamePlates.value) {
        figure.mesh.add(figure.labelSprite);
      }
    }).bind(this);
  }

  ngOnInit(): void {
    // Subscribe to Overriding setting to display Name Plates
    this.persistentNamePlates$$ = this.gses.persistentNamePlates.subscribe((persistentNamePlates) => {
      this.changeNameTagVisibilityInScene(persistentNamePlates);
    });

    /** This should be cleaned and clarified */
    this.playerChange$$ = this.gameState.observableState.playerChange$.subscribe((p: Player) => {
      const figureItem = this.allFigures.find((item: FigureItem) => {
        return item.mesh.userData.physicsId === p.figureId;
      });

      if (figureItem === undefined) {
        console.warn('figure hasnt been initialized yet, but hiddenState is to be set', p.figureId, this.allFigures);
        return;
      }

      if (p.figureModel !== undefined) {
        console.debug('loading new playerTex', p.figureModel);
        // TODO prevent loading Textures all the time/ prevent if not necessary
        this.loader.switchTex(figureItem.mesh, p.figureModel);
      }

      if (p.hasLeft !== figureItem.isHidden) {
        console.debug('changing hiddenState', p.hasLeft, figureItem.isHidden, this.allFigures);
        if (figureItem.isHidden) {
          this.sceneTree.add(figureItem.mesh);
          figureItem.isHidden = false;
        } else {
          this.sceneTree.remove(figureItem.mesh);
          figureItem.isHidden = true;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.persistentNamePlates$$.unsubscribe();
    this.playerChange$$.unsubscribe();
  }

  public bind(viewport: ViewportComponent): void {
    this.camera = viewport.camera;
    this.rendererDomReference = viewport.renderer.domElement;
    this.sceneTree = viewport.sceneTree;
  }

  throwDice(): void {
    this.gameState.isMyTurnOnce$().subscribe((myTurn: boolean) => {
      if (myTurn) {
        this._throwDice();
      } else {
        console.debug('You are not the active Player!');
      }
    });
  }

  private _throwDice(): void {
    console.debug('throwing Dice', this.physics.dice, PhysicsCommands.getPhysId(this.physics.dice));
    if (this.physics.dice !== undefined) {
      const physIdDice = PhysicsCommands.getPhysId(this.physics.dice);
      this.physics.setPosition(physIdDice, 0, 40, 0);

      const getSignedRandom = () => (Math.random() - 0.5) * 2;
      const vel = new Vector3(getSignedRandom(), Math.random() / 5, getSignedRandom());
      vel.normalize().multiplyScalar(Math.random() * 30);
      this.physics.setVelocity(physIdDice, vel.x, vel.y, vel.z);

      const rotSpeed = 2 * Math.PI * (getSignedRandom() * 0.5 + 5);
      const rotation = new Vector3().setFromSphericalCoords(
        rotSpeed,
        (Math.random() * 0.3 + 0.35) * Math.PI, // main rotational axis should not be vertical. therefore restrict phi.
        Math.random() * 2 * Math.PI
      );
      this.physics.setAngularVelocity(physIdDice, rotation.x, rotation.y, rotation.z);
      this.physics.wakeAll();
    }
  }

  getSpritesPending(): number {
    return this.allFigures.length;
  }

  createSprites(): Observable<Progress> {
    return new Observable<Progress>((o: Observer<Progress>) => {
      let count = 0;
      o.next([0, this.allFigures.length]);
      this.allFigures.forEach((figure: FigureItem) => {
        if (figure.labelSprite === undefined) {
          console.debug('adding Sprite for player ', figure.name);
          this.generatePlayerSprite(figure);
        }

        // add label into scene if nametags are shown
        if (this.gses.persistentNamePlates.value) {
          figure.mesh.add(figure.labelSprite);
        }
        count++;
        o.next([count, this.allFigures.length]);
      });
      o.complete();
    });
  }

  private generatePlayerSprite(figure: FigureItem) {
    console.debug('adding Sprite for player ', figure.name);
    figure.labelSprite = this.loader.createPredefLabelSprite(figure.name);
    figure.labelSprite.position.set(0, 5, 0);
  }

  // public function to correctly behave with both key and overriding Setting
  showNameTags(isShown: boolean): void {
    if (!this.gses.persistentNamePlates.value) this.changeNameTagVisibilityInScene(isShown);
  }

  // private function to actually handle show/hide nametags
  private changeNameTagVisibilityInScene(isShown: boolean): void {
    for (const figure of this.allFigures) {
      if (figure.labelSprite === undefined) {
        console.debug('update: adding Sprite for player ', figure.name);
        figure.labelSprite = this.loader.createPredefLabelSprite(figure.name);
        figure.labelSprite.position.set(0, 5, 0);
      }
      if (isShown) {
        figure.mesh.add(figure.labelSprite);
      } else {
        figure.mesh.remove(figure.labelSprite);
      }
    }
  }

  hoverGameFigure(object: Object3D, x: number, z: number): void {
    const physID = PhysicsCommands.getPhysId(object);
    // pick up figure, set to no spatial velocity, rotation is ok, but the figure shouldnt move.
    this.physics.setPosition(physID, x, 10, z);
    this.physics.setVelocity(physID, 0, 0, 0);
  }

  respawnMyFigure(): void {
    this.gameState
      .getMe$()
      .pipe(take(1))
      .subscribe((me: Player) => {
        const physID = me.figureId;
        this.physics.setPosition(physID, 0, 15, 0);
        this.physics.setVelocity(physID, 0, 0, 0);
      });
  }

  moveGameFigure(object: Object3D, fieldID: number): void {
    console.debug('move Figure to ', fieldID);
    let playerId: string;
    const userData = object.userData;
    this.gameState
      .findInPlayerListOnce$((p: Player) => {
        return p.figureId === userData.physicsId;
      })
      .subscribe((player: Player | undefined) => {
        if (player !== undefined) {
          playerId = player.loginName;
        }
        const msg: GameSetTile = {
          type: MessageType.GAME_MESSAGE,
          action: GameActionType.setTile,
          figureId: userData.physicsId,
          playerId: playerId,
          tileId: fieldID,
        };
        this.gameState.sendMessage(MessageType.GAME_MESSAGE, msg);
      });
  }

  addFlummi(x: number, y: number, z: number, color: number): void {
    // const geometry = new SphereGeometry( 2, 32, 32 );
    const geometry = new SphereBufferGeometry(2, 32, 32);
    const material = new MeshStandardMaterial({ color: color });
    const sphere = new Mesh(geometry, material);
    sphere.position.set(x, y, z);
    // this.scene.add( sphere );
    // TODO rebuild Flummis, because important
    // this.physics.setVelocity(physId, (2 * Math.random() - 1) * 15, Math.random() * 15, (2 * Math.random() - 1) * 15);
  }

  addMarker(x: number, y: number, z: number, col: number): void {
    // TODO rebuild Marker, because important
    const markerMat = new MeshStandardMaterial({ color: col });
    const marker = new Mesh(this.markerGeo, markerMat);
    marker.castShadow = true;
    marker.receiveShadow = true;
    marker.position.x = x;
    marker.position.y = y + this.markerGeo.parameters.height / 2;
    marker.position.z = z;
    console.info('new Marker at: ', x, y, marker.position.z);
    marker.rotateX(Math.PI);
    // this.scene.add(marker);
    // this.boardItems.push({mesh: marker, role: BoardItemRole.marker, removeBy: Date.now() + 10000});
  }
}
