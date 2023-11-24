import { Injectable } from '@angular/core';
import { ObjectLoaderService } from './object-loader/object-loader.service';
import { BoardTilesService } from './board-tiles.service';
import { Group } from 'three';
import { GameComponent } from '../components/game/game.component';
import { GameStateService } from './game-state.service';
import { BoardItemControlService } from './board-item-control.service';
import { Observable, Observer, forkJoin } from 'rxjs';
import { Progress } from './object-loader/loaderTypes';
import { map, mergeMap, take, tap } from 'rxjs/operators';

export interface ColyseusNotifiable {
  attachColyseusMessageCallbacks(gameState: GameStateService): void;
}

@Injectable({
  providedIn: 'root',
})
export class GameInitialisationService {
  constructor(
    private objectLoader: ObjectLoaderService,
    private boardTilesService: BoardTilesService,
    private bic: BoardItemControlService
  ) {}

  /** Access function providing a slim interface for initializations with feedback */
  init(game: GameComponent): Observable<Progress> {
    return new Observable((o: Observer<Progress>) => {
      this._init(game, o);
    });
  }

  /**
   * Does the heavy lifting for initializing a given game component by scheduling and
   * executing all operations needed, while providing feedback to an external observer
   * @param game the game component that should be initialized.
   * @param observer the observer that is receiving progress feedback.
   * @private
   */
  private _init(game: GameComponent, observer: Observer<Progress>) {
    /** Start the loading process by notifying any subscribers with an initial [0, 0] */
    const totalProgress: Progress = [0, 0];
    observer.next(totalProgress);

    /** Build the list of heavy operations that need to be done and bind the total progress to them */
    const operations: Observable<Progress>[] = [
      game.viewRef.initializeScene(),
      //this.objectLoader.loadCommonObjects(),
      this.bic.physics.initializeFromState(),
      this.boardTilesService.initialize((grp: Group) => game.viewRef.sceneTree.add(grp)),
      this.bic.createSprites(),
    ].map((o: Observable<Progress>) => this._asProgressChunk(o, totalProgress, observer));

    /** Wait for the room data to be available and execute all heavy operations in parallel afterwards
     *  @note take(1) is used to .unsubscribe() right after executing the init process once */
    this.bic.gameState.isRoomDataAvailable$
      .pipe(
        take(1),
        tap((_: boolean) => console.timeEnd('Colyseus ready after')),
        mergeMap((_: boolean) => forkJoin(operations))
      )
      .subscribe(() => {
        this._finalizeLoad(game);
        observer.complete();
      });
  }

  /**
   * Binds a large operation that is reporting its progress and is wrapped as an Observable<Progress>
   * to a bigger sequence of operations that itself is represented through a Progress object.
   * @param chunk the operation that will be reporting its progress to the totalProgress.
   * @param overarchingProgress the object representing an overarching operation that consists of multiple smaller chunks
   * @param overarchingObserver the observer that notifies the external overarchingProgress
   * @private
   */
  private _asProgressChunk(
    chunk: Observable<Progress>,
    overarchingProgress: Progress,
    overarchingObserver: Observer<Progress>
  ): Observable<Progress> {
    let isTotalAlreadyAdded = false;
    let lastValue = 0;
    return chunk.pipe(
      map((p: Progress) => {
        if (!isTotalAlreadyAdded) {
          overarchingProgress[1] = overarchingProgress[1] + p[1];
          isTotalAlreadyAdded = true;
        }
        overarchingProgress[0] = overarchingProgress[0] + p[0] - lastValue;
        lastValue = p[0];
        overarchingObserver.next(overarchingProgress);
        return p;
      })
    );
  }

  /**
   * Last actions performed before notifying any subscriber that the loading process finished.
   * Any final adjustments like resizing the viewport to the correct size should be done here.
   * @param game the game component that is currently being initialized.
   * @private
   */
  private _finalizeLoad(game: GameComponent) {
    this.bic.physics.wakeAll();
    /** Resize viewport to avoid space where scrollbars would have been previously */
    game.viewRef.onWindowResize(undefined);
    game.viewRef.startRendering();
  }
}
