/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Room } from 'colyseus.js';
import { Observable, ReplaySubject, debounceTime, map, mergeWith } from 'rxjs';
import { GameState } from '../model/state/GameState';
import { VoteEntry } from '../components/game/interface/menu-bar/vote-system/helpers/VoteEntry';
import { Tile } from '../model/state/BoardLayoutState';
import { Link } from '../model/state/Link';
import { PhysicsObjectState } from '../model/state/PhysicsState';
import { Player } from '../model/state/Player';
import { Rule } from '../model/state/Rule';
import { ArraySchema, MapSchema, Schema } from '@colyseus/schema';
import { VoteState } from '../model/state/VoteState';

// This line is fine for using Function, since Function is used to exclude types
export declare type NonFunctionPropNames<T> = {
  /* eslint-disable-next-line @typescript-eslint/ban-types */
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export type GameStateAsObservables = {
  round$: ReplaySubject<number>;
  action$: ReplaySubject<string>;
  hostLoginName$: ReplaySubject<string>;
  hasStarted$: ReplaySubject<boolean>;
  currentPlayerLogin$: ReplaySubject<string>;
  reversed$: ReplaySubject<boolean>;
  rules$: ReplaySubject<ArraySchema<Rule>>;
  drinkBuddyLinks$: ReplaySubject<ArraySchema<Link>>;
  voteState: {
    author$: ReplaySubject<string>;
    voteStage$: ReplaySubject<number>;
    closingIn$: ReplaySubject<number>;
    voteConfiguration: {
      author$: ReplaySubject<string>;
      title$: ReplaySubject<string>;
      ineligibles$: ReplaySubject<ArraySchema<string>>;
      votingOptions$: ReplaySubject<ArraySchema<VoteEntry>>;
    };
  };
  boardLayout: {
    tileList$: ReplaySubject<MapSchema<Tile>>;
  };
  physicsState: {
    objects$: ReplaySubject<MapSchema<PhysicsObjectState>>;
    objectsMoved$: ReplaySubject<PhysicsObjectState>;
  };
  // tracks the whole MapSchema, and the MapSchema gets transmitted
  playerList$: ReplaySubject<MapSchema<Player>>;
  // tracks all players in PlayerList, but transmitts Players.
  //   This makes it possible to use filter in a pipe
  playerChange$: ReplaySubject<Player>;
  voteState$: Observable<VoteState>;
};

// Tipp: Hol dir erstmal nen Kaffee, bevor du hier anfängst zu lesen

export class ColyseusObservableState {
  /** Subjects for State */
  public gameState: GameStateAsObservables = {
    round$: new ReplaySubject<number>(1),
    action$: new ReplaySubject<string>(1),
    hostLoginName$: new ReplaySubject<string>(1),
    hasStarted$: new ReplaySubject<boolean>(1),
    currentPlayerLogin$: new ReplaySubject<string>(1),
    reversed$: new ReplaySubject<boolean>(1),
    rules$: new ReplaySubject<ArraySchema<Rule>>(1),
    drinkBuddyLinks$: new ReplaySubject<ArraySchema<Link>>(1),
    voteState: {
      author$: new ReplaySubject<string>(1),
      voteStage$: new ReplaySubject<number>(1),
      closingIn$: new ReplaySubject<number>(1),
      voteConfiguration: {
        author$: new ReplaySubject<string>(1),
        title$: new ReplaySubject<string>(1),
        ineligibles$: new ReplaySubject<ArraySchema<string>>(1),
        votingOptions$: new ReplaySubject<ArraySchema<VoteEntry>>(1),
      },
    },
    boardLayout: {
      tileList$: new ReplaySubject<MapSchema<Tile>>(1),
    },
    physicsState: {
      objects$: new ReplaySubject<MapSchema<PhysicsObjectState>>(1),
      objectsMoved$: new ReplaySubject<PhysicsObjectState>(1),
    },
    // tracks the whole MapSchema, and the MapSchema gets transmitted
    playerList$: new ReplaySubject<MapSchema<Player>>(1),

    /** tracks all players in PlayerList, but transmits Players.
     *    tracks more than 1 change
     *
     *    popular usage is with:
     *      .filter((p: Player) => p.loginName === "asd").debounceTime(0)
     *
     *    this filters for the correct player and only lets events with 0ms
     *    free time in front pass through. Therefore only the last event of
     *    the events being replayed makes it through, but all events
     *    following should pass. Note that the 0ms are filtering in reality
     *    more like 5-10ms, but events in that quick succession should be
     *    pretty uncommon.
     */
    playerChange$: new ReplaySubject<Player>(),
    voteState$: new Observable<VoteState>(),
  };

  constructor(activeRoom$: ReplaySubject<Room<GameState>>) {
    this.setupObservables(activeRoom$);
  }

  // returns a function to push a given value into a subject
  // used to convert from callbacks to observables
  private pushToSubject<T>(subject: ReplaySubject<T>): (currentValue: T) => void {
    return (currentValue: T) => {
      subject.next(currentValue);
    };
  }

  private touchOnExistence<T extends Schema, K extends NonFunctionPropNames<T>>(root: T, target: K, touchCallbacks: () => void) {
    if (root[target] !== undefined) {
      touchCallbacks();
    } else {
      root.listen<K>(target, () => touchCallbacks());
    }
  }

  private touchCollectionCallbacks<T, S extends MapSchema<T> | ArraySchema<T>>(
    collection: S,
    callbacks: {
      onChange: (item: T, key: string) => void;
      onRemove: (item: T, key: string) => void;
      onAdd: (item: T, key: string) => void;
    }
  ) {
    collection.onChange = callbacks.onChange;
    collection.onRemove = callbacks.onRemove;
    collection.onAdd = callbacks.onAdd;
  }

  private touchCollectionCallbacksSchemaSimple<T extends Schema, S extends MapSchema<T> | ArraySchema<T>>(
    collection: S,
    trigger: () => void
  ) {
    this.touchCollectionCallbacks<T, S>(collection, {
      onChange: trigger,
      onRemove: trigger,
      onAdd: (item: T) => {
        trigger();
        item.onChange = () => {
          trigger();
        };
      },
    });
  }

  private touchCollectionCallbacksPrimitiveSimple<T extends string | number, S extends MapSchema<T> | ArraySchema<T>>(
    collection: S,
    trigger: () => void
  ) {
    this.touchCollectionCallbacks<T, S>(collection, {
      onChange: trigger,
      onRemove: trigger,
      onAdd: trigger,
    });
  }

  // Set up all callbacks for correct acting of the observables for the state
  private setupObservables(activeRoom$: ReplaySubject<Room<GameState>>) {
    activeRoom$.subscribe((room: Room<GameState>) => {
      // easy accessible direct primitives
      room.state.listen('round', this.pushToSubject<number>(this.gameState.round$));
      if (room.state.round) this.gameState.round$.next(room.state.round);
      room.state.listen('action', this.pushToSubject<string>(this.gameState.action$));
      if (room.state.action) this.gameState.action$.next(room.state.action);
      room.state.listen('hostLoginName', this.pushToSubject<string>(this.gameState.hostLoginName$));
      if (room.state.hostLoginName) this.gameState.hostLoginName$.next(room.state.hostLoginName);
      room.state.listen('hasStarted', this.pushToSubject<boolean>(this.gameState.hasStarted$));
      if (room.state.hasStarted) this.gameState.hasStarted$.next(room.state.hasStarted);
      room.state.listen('currentPlayerLogin', this.pushToSubject<string>(this.gameState.currentPlayerLogin$));
      if (room.state.currentPlayerLogin) this.gameState.currentPlayerLogin$.next(room.state.currentPlayerLogin);
      room.state.listen('reversed', this.pushToSubject<boolean>(this.gameState.reversed$));
      if (room.state.reversed) this.gameState.reversed$.next(room.state.reversed);

      // children Schemas, keep aware, these are only to be attached once the corresponding state object has been created
      this.setupObservablesVoting(room);

      // collections of Schemas
      this.setupObservablesRules(room);
      this.setupObservablesBuddyLinks(room);
      this.setupObservablesBoardLayout(room);

      // collections with nested schemas
      this.setupObservablesPhysicsState(room);

      // collections with nested collections
      this.setupObservablesPlayerlist(room);

      // combined observable from lower level observables
      this.setupObservableConsolidatedVoteState(room);
    });
  }

  private setupObservablesVoting(room: Room<GameState>): void {
    this.touchOnExistence(room.state, 'voteState', () => {
      room.state.voteState.listen('author', this.pushToSubject<string>(this.gameState.voteState.author$));
      if (room.state.voteState.author) this.gameState.voteState.author$.next(room.state.voteState.author);
      room.state.voteState.listen('voteStage', this.pushToSubject<number>(this.gameState.voteState.voteStage$));
      if (room.state.voteState.voteStage) this.gameState.voteState.voteStage$.next(room.state.voteState.voteStage);
      room.state.voteState.listen('closingIn', this.pushToSubject<number>(this.gameState.voteState.closingIn$));
      if (room.state.voteState.closingIn) this.gameState.voteState.closingIn$.next(room.state.voteState.closingIn);

      this.touchOnExistence(room.state.voteState, 'voteConfiguration', () => {
        room.state.voteState.voteConfiguration.listen(
          'author',
          this.pushToSubject<string>(this.gameState.voteState.voteConfiguration.author$)
        );
        if (room.state.voteState.voteConfiguration.author)
          this.gameState.voteState.voteConfiguration.author$.next(room.state.voteState.voteConfiguration.author);
        room.state.voteState.voteConfiguration.listen(
          'title',
          this.pushToSubject<string>(this.gameState.voteState.voteConfiguration.title$)
        );
        if (room.state.voteState.voteConfiguration.title)
          this.gameState.voteState.voteConfiguration.title$.next(room.state.voteState.voteConfiguration.title);

        this.touchCollectionCallbacksPrimitiveSimple(room.state.voteState.voteConfiguration.ineligibles, () => {
          this.gameState.voteState.voteConfiguration.ineligibles$.next(room.state.voteState.voteConfiguration.ineligibles);
        });

        // send initial Values if already present
        if (room.state.voteState.voteConfiguration.ineligibles.length > 0) {
          this.gameState.voteState.voteConfiguration.ineligibles$.next(room.state.voteState.voteConfiguration.ineligibles);
        }

        this.touchCollectionCallbacks(room.state.voteState.voteConfiguration.votingOptions, {
          onChange: () => {
            this.gameState.voteState.voteConfiguration.votingOptions$.next(room.state.voteState.voteConfiguration.votingOptions);
          },
          onRemove: () => {
            this.gameState.voteState.voteConfiguration.votingOptions$.next(room.state.voteState.voteConfiguration.votingOptions);
          },
          onAdd: (voteEntry: VoteEntry) => {
            this.gameState.voteState.voteConfiguration.votingOptions$.next(room.state.voteState.voteConfiguration.votingOptions);

            voteEntry.onChange = () => {
              this.gameState.voteState.voteConfiguration.votingOptions$.next(room.state.voteState.voteConfiguration.votingOptions);
            };

            this.touchOnExistence(voteEntry, 'castVotes', () => {
              this.touchCollectionCallbacksPrimitiveSimple(voteEntry.castVotes, () => {
                this.gameState.voteState.voteConfiguration.votingOptions$.next(room.state.voteState.voteConfiguration.votingOptions);
              });
            });
          },
        });

        // send initial Values if already present
        if (room.state.voteState.voteConfiguration.votingOptions.length > 0) {
          this.gameState.voteState.voteConfiguration.votingOptions$.next(room.state.voteState.voteConfiguration.votingOptions);
        }
      });
    });
  }

  private setupObservablesRules(room: Room<GameState>): void {
    this.touchOnExistence(room.state, 'rules', () => {
      this.touchCollectionCallbacksSchemaSimple(room.state.rules, () => {
        this.gameState.rules$.next(room.state.rules);
      });

      // send initial Values if already present
      if (room.state.rules.length > 0) {
        this.gameState.rules$.next(room.state.rules);
      }
    });
  }

  private setupObservablesBuddyLinks(room: Room<GameState>): void {
    this.touchOnExistence(room.state, 'drinkBuddyLinks', () => {
      this.touchCollectionCallbacksSchemaSimple(room.state.drinkBuddyLinks, () => {
        this.gameState.drinkBuddyLinks$.next(room.state.drinkBuddyLinks);
      });

      // send initial Values if already present
      if (room.state.drinkBuddyLinks.length > 0) {
        this.gameState.drinkBuddyLinks$.next(room.state.drinkBuddyLinks);
      }
    });
  }

  private setupObservablesBoardLayout(room: Room<GameState>): void {
    this.touchOnExistence(room.state, 'boardLayout', () => {
      this.touchOnExistence(room.state.boardLayout, 'tileList', () => {
        this.touchCollectionCallbacksSchemaSimple(room.state.boardLayout.tileList, () => {
          this.gameState.boardLayout.tileList$.next(room.state.boardLayout.tileList);
        });

        // send initial Values if already present
        if (room.state.boardLayout.tileList.size > 0) {
          this.gameState.boardLayout.tileList$.next(room.state.boardLayout.tileList);
        }
      });
    });
  }

  private setupObservablesPhysicsState(room: Room<GameState>): void {
    this.touchOnExistence(room.state, 'physicsState', () => {
      this.touchOnExistence(room.state.physicsState, 'objects', () => {
        this.touchCollectionCallbacks(room.state.physicsState.objects, {
          onChange: () => {
            this.gameState.physicsState.objects$.next(room.state.physicsState.objects);
          },
          onRemove: () => {
            this.gameState.physicsState.objects$.next(room.state.physicsState.objects);
          },
          onAdd: (physicsObjectState: PhysicsObjectState) => {
            this.gameState.physicsState.objects$.next(room.state.physicsState.objects);

            physicsObjectState.onChange = () => {
              // TODO: should objectList get updates when one object Changes?
              this.gameState.physicsState.objects$.next(room.state.physicsState.objects);
            };
            physicsObjectState.position.onChange = () => {
              this.gameState.physicsState.objects$.next(room.state.physicsState.objects);
              this.gameState.physicsState.objectsMoved$.next(physicsObjectState);
            };
            physicsObjectState.quaternion.onChange = () => {
              this.gameState.physicsState.objects$.next(room.state.physicsState.objects);
              this.gameState.physicsState.objectsMoved$.next(physicsObjectState);
            };
          },
        });

        // send initial Values if already present
        if (room.state.physicsState.objects.size > 0) {
          this.gameState.physicsState.objects$.next(room.state.physicsState.objects);
        }
      });
    });
  }

  private setupObservablesPlayerlist(room: Room<GameState>): void {
    this.touchOnExistence(room.state, 'playerList', () => {
      this.touchCollectionCallbacks(room.state.playerList, {
        onChange: (player: Player) => {
          console.log('onChange PlayerList', player, room.state.playerList);
          this.gameState.playerList$.next(room.state.playerList);
          this.gameState.playerChange$.next(player);
        },
        onRemove: (player: Player) => {
          console.log('onRemove PlayerList', player, room.state.playerList);
          this.gameState.playerList$.next(room.state.playerList);
          // TODO: Need to notify playerChange?
        },
        onAdd: (player: Player) => {
          console.log('onAdd PlayerList', player, room.state.playerList);
          this.gameState.playerList$.next(room.state.playerList);
          this.gameState.playerChange$.next(player);

          player.onChange = (datachange) => {
            this.gameState.playerList$.next(room.state.playerList); // TODO: should PlayerList get updates when one Player Changes?
            this.gameState.playerChange$.next(player);
            console.log('onChange Player', player, datachange);
          };

          this.touchCollectionCallbacks<number, MapSchema<number>>(player.itemList, {
            onChange: (item) => {
              this.gameState.playerChange$.next(player);
              console.log('onChange item', player, room.state.playerList, item);
            },
            onRemove: (item) => {
              this.gameState.playerChange$.next(player);
              console.log('onRemove item', player, room.state.playerList, item);
            },
            onAdd: (item) => {
              this.gameState.playerChange$.next(player);
              console.log('onAdd item', player, room.state.playerList, item);
            },
          });
        },
      });

      // send initial Values if already present
      if (room.state.playerList.size > 0) {
        this.gameState.playerList$.next(room.state.playerList);
      }
      room.state.playerList.forEach((player: Player) => {
        this.gameState.playerChange$.next(player);
      });
    });
  }

  private setupObservableConsolidatedVoteState(room: Room<GameState>): void {
    this.gameState.voteState$ = this.gameState.voteState.author$
      .pipe(
        mergeWith(
          this.gameState.voteState.voteStage$,
          this.gameState.voteState.closingIn$,
          this.gameState.voteState.voteConfiguration.author$,
          this.gameState.voteState.voteConfiguration.title$,
          this.gameState.voteState.voteConfiguration.ineligibles$,
          this.gameState.voteState.voteConfiguration.votingOptions$
        )
      )
      .pipe(map(() => room.state.voteState))
      .pipe(debounceTime(0));
  }
}
