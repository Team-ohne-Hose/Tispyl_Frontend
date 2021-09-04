import { Injectable } from '@angular/core';
import { ViewportComponent } from '../components/game/viewport/viewport.component';
import { ObjectLoaderService } from './object-loader.service';
import { PhysicsCommands } from '../components/game/viewport/helpers/PhysicsCommands';
import { BoardTilesService } from './board-tiles.service';
import * as THREE from 'three';
import { GameComponent } from '../components/game/game.component';
import { ChatService } from './chat.service';
import { GameStateService } from './game-state.service';
import { ItemService } from './items-service/item.service';
import { BoardItemControlService } from './board-item-control.service';

export interface ColyseusNotifyable {
  attachColyseusStateCallbacks(gameState: GameStateService): void;

  attachColyseusMessageCallbacks(gameState: GameStateService): void;
}

@Injectable({
  providedIn: 'root',
})
export class GameInitialisationService {
  private colyseusReady = false;
  private staticReady = false;

  private viewPort: ViewportComponent;
  private game: GameComponent;

  private colyseusNotifyableClasses: ColyseusNotifyable[] = [];

  constructor(
    private objectLoader: ObjectLoaderService,
    private chatService: ChatService,
    private itemService: ItemService,
    private boardTilesService: BoardTilesService,
    private bic: BoardItemControlService
  ) {
    this.bic.gameState.isColyseusReady.subscribe((suc) => this.setColyseusReady());
  }

  async startInitialisation(game: GameComponent): Promise<void> {
    this.game = game;
    this.viewPort = this.game.viewRef;

    console.debug('starting Initialisation of game engine');
    this.game.loadingScreenRef.startTips();

    this.colyseusNotifyableClasses = [];
    this.colyseusNotifyableClasses.push(this.boardTilesService);
    this.colyseusNotifyableClasses.push(this.bic);
    this.colyseusNotifyableClasses.push(this.bic.physics);
    this.colyseusNotifyableClasses.push(this.game.interfaceRef.stateDisplayRef);
    this.colyseusNotifyableClasses.push(this.game.interfaceRef.tileOverlayRef);
    this.colyseusNotifyableClasses.push(this.game.interfaceRef);
    this.colyseusNotifyableClasses.push(this.game.interfaceRef.connectedPlayersRef);
    this.colyseusNotifyableClasses.push(this.chatService);
    this.colyseusNotifyableClasses.push(this.itemService);

    console.debug('loading Textures');
    await this.objectLoader.loadAllObjects((progress: number, total: number) => {
      console.debug('loading common files: ' + progress + '/' + total, (progress / total) * 50 + '%');
      game.loadingScreenRef.setProgress((progress / total) * 50);
    });

    console.debug('loading of common files done');

    console.debug('creating static Scene');
    this.viewPort.initializeScene();

    // check/wait for colyseus to recieve first patch
    this.staticReady = true;
    if (this.colyseusReady) {
      this.afterColyseusInitialisation();
    } else {
      console.debug('waiting for colyseus initialisation finished');
    }
  }

  setColyseusReady(): void {
    console.info('Setting colyseus ready. Gamestate is: ', this.bic.gameState);

    if (!this.colyseusReady) {
      console.debug('Colyseus is ready');
      this.colyseusReady = true;

      // if static has already loaded, proceed to init, because static loading stopped and is waiting for colyseus
      if (this.staticReady) {
        this.afterColyseusInitialisation();
      } else {
        console.debug('waiting for common initialisation to be finished');
      }
    }
  }

  private afterColyseusInitialisation(): void {
    console.info('colyseus is initialized and common files are loaded');
    console.debug('attaching colyseus callbacks');
    this.colyseusNotifyableClasses.forEach((obj: ColyseusNotifyable, index: number, array: ColyseusNotifyable[]) => {
      if (obj === undefined) {
        console.error('couldnt attach colyseus Callbacks because the object was undefined', index, array);
      } else {
        obj.attachColyseusMessageCallbacks(this.bic.gameState);
        obj.attachColyseusStateCallbacks(this.bic.gameState);
      }
    });

    let progress = 0;
    const initPending = this.bic.physics.getInitializePending();
    this.bic.physics.initializeFromState(() => {
      return;
    });
    const spritesPending = this.bic.getSpritesPending();
    const queued = 64 + initPending + spritesPending;
    console.info('loading: 64 Tiles, ', initPending, ' phys Pending ', spritesPending, ' sprites Pending');

    const doneCallback = () => {
      /** Resize viewport right before removing loading screen to avoid space where scrollbars would have been previously */
      this.game.viewRef.onWindowResize(undefined);

      /** Remove loading screen and stop loading screen tips from looping */
      this.game.loadingScreenRef.stopTips();
      this.game.loadingScreenVisible = false;
      console.info('loading done. Entering Game..');

      /** Start render loop */
      this.viewPort.startRendering();
    };

    const onProgress = () => {
      progress++;
      console.debug('loading instance specific files: ' + progress + '/' + queued, (progress / queued) * 50 + 50 + '%');
      if (this.game.loadingScreenRef !== undefined) {
        this.game.loadingScreenRef.setProgress((progress / queued) * 50 + 50);
      }
      if (progress === queued) {
        doneCallback();
      }
    };
    console.debug('creating dynamic gameboard');
    this.boardTilesService.initialize(((grp: THREE.Group) => this.viewPort.sceneTree.add(grp)).bind(this), onProgress);

    console.debug('creating dynamic objects & players');
    this.bic.physics.initializeFromState(onProgress);
    this.bic.createSprites(onProgress);
  }
}
