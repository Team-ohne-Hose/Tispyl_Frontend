import { Injectable } from '@angular/core';
import {ViewportComponent} from '../game/viewport/viewport.component';
import {ObjectLoaderService} from './object-loader.service';
import {BoardItemManagement} from '../game/viewport/BoardItemManagement';
import {PhysicsCommands} from '../game/viewport/PhysicsCommands';
import {ChatWindowComponent} from '../game/interface/chat-window/chat-window.component';
import {NextTurnButtonComponent} from '../game/interface/next-turn-button/next-turn-button.component';
import {TileOverlayComponent} from '../game/interface/tile-overlay/tile-overlay.component';
import {BoardTilesService} from './board-tiles.service';
import * as THREE from 'three';
import {GameComponent} from '../game/game.component';

export interface ColyseusNotifyable {
  attachColyseusStateCallbacks(): void;
  attachColyseusMessageCallbacks(): void;
}
@Injectable({
  providedIn: 'root'
})
export class GameInitialisationService {

  private colyseusReady = false;
  private staticReady = false;

  private viewPort: ViewportComponent;
  private game: GameComponent;
  private boardTilesService: BoardTilesService;

  private colyseusNotifyableClasses: ColyseusNotifyable[] = [];

  constructor(private objectLoader: ObjectLoaderService) { }

  async startInitialisation(game: GameComponent,
                            viewPort: ViewportComponent,
                            boardItemManagement: BoardItemManagement,
                            physicsCommands: PhysicsCommands,
                            boardTilesService: BoardTilesService) {
    console.debug('starting Initialisation of game engine');
    game.loadingScreenRef.startTips();
    this.viewPort = viewPort;
    this.game = game;
    this.boardTilesService = boardTilesService;

    this.colyseusNotifyableClasses = [];
    this.colyseusNotifyableClasses.push(this.boardTilesService);
    this.colyseusNotifyableClasses.push(boardItemManagement);
    this.colyseusNotifyableClasses.push(physicsCommands);
    this.colyseusNotifyableClasses.push(game.interfaceRef.chatRef);
    this.colyseusNotifyableClasses.push(game.interfaceRef.nextTurnRef);
    this.colyseusNotifyableClasses.push(game.interfaceRef.tileOverlayRef);
    this.colyseusNotifyableClasses.push(game.interfaceRef.voteSystemRef);
    this.colyseusNotifyableClasses.push(game.interfaceRef);
    this.colyseusNotifyableClasses.push(game.interfaceRef.connectedPlayersRef);

    console.debug('loading Textures');
    await this.objectLoader.loadAllObjects((progress: number, total: number) => {
      console.debug('loading common files: ' + progress + '/' + total, ((progress / total) * 50) + '%');
      game.loadingScreenRef.setProgress((progress / total) * 50);
    });
    console.debug('loading of common files done');

    console.debug('creating static Scene');
    viewPort.initialiseScene();

    // check/wait for colyseus to recieve first patch
    this.staticReady = true;
    if (this.colyseusReady) {
      this.afterColyseusInitialisation();
    } else {
      console.debug('waiting for colyseus initialisation finished');
    }
  }
  private afterColyseusInitialisation() {
    console.info('colyseus is initialized and common files are loaded');
    console.debug('attaching colyseus callbacks');
    this.colyseusNotifyableClasses.forEach((obj: ColyseusNotifyable, index: number, array: ColyseusNotifyable[]) => {
      if (obj === undefined) {
        console.error('couldnt attach colyseus Callbacks because the object was undefined', index, array);
      } else {
        obj.attachColyseusMessageCallbacks();
        obj.attachColyseusStateCallbacks();
      }
    });

    let progress = 0;
    const queued = 64 + this.viewPort.physics.getInitializePending() + this.viewPort.boardItemManager.getSpritesPending();
    const doneCallback = () => {
      console.info('loading done. Entering Game..');
      this.viewPort.startRendering();
      this.game.loadingScreenRef.stopTips();
      this.game.loadingScreenVisible = false;
    };
    const onProgress = () => {
      progress++;
      console.debug('loading instance specific files: ' + progress + '/' + queued, ((progress / queued) * 50 + 50) + '%');
      this.game.loadingScreenRef.setProgress(((progress / queued) * 50 + 50));
      if (progress >= queued) {
        doneCallback();
      }
    };

    console.debug('creating dynamic gameboard');
    this.boardTilesService.initialize(((grp: THREE.Group) => this.viewPort.scene.add(grp)).bind(this), onProgress);

    console.debug('creating dynamic objects & players');
    this.viewPort.physics.initializeFromState(onProgress);
    this.viewPort.boardItemManager.createSprites(onProgress);
  }

  setColyseusReady() {
    if (!this.colyseusReady) {
      this.colyseusReady = true;

      // if static has already loaded, proceed to init, because static loading stopped and is waiting for colyseus
      if (this.staticReady) {
        this.afterColyseusInitialisation();
      } else {
        console.debug('waiting for common initialisation to be finished');
      }
    }
  }
}
