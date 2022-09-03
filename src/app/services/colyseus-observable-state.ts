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

  private room;

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

  /** attaches necessary callbacks to notify replaySubjects for changes on
   *    an ArraySchema or MapSchema
   * @param schema the schema to monitor
   * @param subject the subject to feed the events to
   * @param forEachChild is a function called for each Child once.
   *              forEachChild allows to attach additional events to the trigger
   * @param additionalTrigger is a function called
   */
  // Tipp: Hol dir erstmal noch nen Kaffee, bevor du hier anfängst zu lesen
  private attachToSchemaCollection<T, SchemaCollection extends ArraySchema<T> | MapSchema<T>>(
    schema: SchemaCollection,
    subject: ReplaySubject<SchemaCollection>,
    triggerList: () => void,
    triggerItem: (item: T) => void,
    forEachChild?: (item: T, trigger: () => void) => void
  ): void {
    if (schema === undefined || subject === undefined) {
      console.error('Trying to attach undefined or attach to undefined: ', schema, subject);
      return;
    }

    const bothTriggers = (item: T) => {
      triggerList();
      triggerItem(item);
    };

    // attach callback when items get added to array,
    // also add onChange callbacks for them when they are added and not primitives
    schema.onAdd = (newItem: T) => {
      if (newItem instanceof Schema) {
        newItem.onChange = () => {
          bothTriggers(newItem);
        };
      }
      if (forEachChild) {
        forEachChild(newItem, () => bothTriggers(newItem));
      }
      bothTriggers(newItem);
    };

    // attach callback when items get removed from array
    schema.onRemove = bothTriggers;
    schema.onChange = bothTriggers;

    if ((schema instanceof ArraySchema && schema.length > 0) || (schema instanceof MapSchema && schema.size > 0)) {
      // attach onChange callbacks to all existing properties
      schema.forEach((item: T) => {
        if (item instanceof Schema) {
          item.onChange = () => {
            bothTriggers(item);
          };
        }
        if (forEachChild) {
          forEachChild(item, () => bothTriggers(item));
        }
        triggerItem(item);
      });
      triggerList();
    }
  }

  // Set up all callbacks for correct acting of the observables for the state
  private setupObservables(activeRoom$: ReplaySubject<Room<GameState>>) {
    activeRoom$.subscribe((room: Room<GameState>) => {
      this.room = room;
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
    const touchVoteConfiguration = () => {
      room.state.voteState.voteConfiguration.listen(
        'author',
        this.pushToSubject<string>(this.gameState.voteState.voteConfiguration.author$)
      );
      if (room.state.voteState.voteConfiguration.author)
        this.gameState.voteState.voteConfiguration.author$.next(room.state.voteState.voteConfiguration.author);
      room.state.voteState.voteConfiguration.listen('title', this.pushToSubject<string>(this.gameState.voteState.voteConfiguration.title$));
      if (room.state.voteState.voteConfiguration.title)
        this.gameState.voteState.voteConfiguration.title$.next(room.state.voteState.voteConfiguration.title);
      this.attachToSchemaCollection<string, ArraySchema<string>>(
        room.state.voteState.voteConfiguration.ineligibles,
        this.gameState.voteState.voteConfiguration.ineligibles$,
        () => this.gameState.voteState.voteConfiguration.ineligibles$.next(room.state.voteState.voteConfiguration.ineligibles),
        () => {}
      );
      this.attachToSchemaCollection<VoteEntry, ArraySchema<VoteEntry>>(
        room.state.voteState.voteConfiguration.votingOptions,
        this.gameState.voteState.voteConfiguration.votingOptions$,
        () => this.gameState.voteState.voteConfiguration.votingOptions$.next(room.state.voteState.voteConfiguration.votingOptions),
        () => {}
      );
    };
    const touchVoteState = () => {
      room.state.voteState.listen('author', this.pushToSubject<string>(this.gameState.voteState.author$));
      if (room.state.voteState.author) this.gameState.voteState.author$.next(room.state.voteState.author);
      room.state.voteState.listen('voteStage', this.pushToSubject<number>(this.gameState.voteState.voteStage$));
      if (room.state.voteState.voteStage) this.gameState.voteState.voteStage$.next(room.state.voteState.voteStage);
      room.state.voteState.listen('closingIn', this.pushToSubject<number>(this.gameState.voteState.closingIn$));
      if (room.state.voteState.closingIn) this.gameState.voteState.closingIn$.next(room.state.voteState.closingIn);
      if (room.state.voteState.voteConfiguration !== undefined) {
        touchVoteConfiguration();
      } else {
        room.state.voteState.listen('voteConfiguration', () => {
          touchVoteConfiguration();
        });
      }
    };

    if (room.state.voteState !== undefined) {
      touchVoteState();
    } else {
      room.state.listen('voteState', () => {
        touchVoteState();
      });
    }
  }

  private setupObservablesRules(room: Room<GameState>): void {
    const attachRules = () => {
      this.attachToSchemaCollection<Rule, ArraySchema<Rule>>(
        room.state.rules,
        this.gameState.rules$,
        () => this.gameState.rules$.next(this.room.state.rules),
        () => {}
      );
    };
    if (room.state.rules !== undefined) {
      attachRules();
    } else {
      room.state.listen('rules', attachRules);
    }
  }

  private setupObservablesBuddyLinks(room: Room<GameState>): void {
    const attachBuddyLinks = () => {
      this.attachToSchemaCollection<Link, ArraySchema<Link>>(
        room.state.drinkBuddyLinks,
        this.gameState.drinkBuddyLinks$,
        () => this.gameState.drinkBuddyLinks$.next(this.room.state.drinkBuddyLinks),
        () => {}
      );
    };
    if (room.state.drinkBuddyLinks !== undefined) {
      attachBuddyLinks();
    } else {
      room.state.listen('drinkBuddyLinks', attachBuddyLinks);
    }
  }

  private setupObservablesBoardLayout(room: Room<GameState>): void {
    const touchTileList = () => {
      this.attachToSchemaCollection<Tile, MapSchema<Tile>>(
        room.state.boardLayout.tileList,
        this.gameState.boardLayout.tileList$,
        () => this.gameState.boardLayout.tileList$.next(room.state.boardLayout.tileList),
        () => {}
      );
    };
    const touchBoardLayout = () => {
      if (room.state.boardLayout.tileList !== undefined) {
        touchTileList();
      } else {
        room.state.boardLayout.listen('tileList', touchTileList);
      }
    };
    if (room.state.boardLayout !== undefined) {
      touchBoardLayout();
    } else {
      room.state.listen('boardLayout', touchBoardLayout);
    }
  }

  private setupObservablesPhysicsState(room: Room<GameState>): void {
    const touchPhysicsObjects = () => {
      this.attachToSchemaCollection<PhysicsObjectState, MapSchema<PhysicsObjectState>>(
        room.state.physicsState.objects,
        this.gameState.physicsState.objects$,
        () => this.gameState.physicsState.objects$.next(room.state.physicsState.objects),
        () => {},
        (item: PhysicsObjectState, trigger: () => void) => {
          item.position.onChange = () => {
            trigger();
            this.gameState.physicsState.objectsMoved$.next(item);
          };
          item.quaternion.onChange = () => {
            trigger();
            this.gameState.physicsState.objectsMoved$.next(item);
          };
        }
      );
    };
    const touchPhysicsState = () => {
      if (room.state.physicsState.objects !== undefined) {
        touchPhysicsObjects();
      } else {
        room.state.physicsState.listen('objects', touchPhysicsObjects);
      }
    };
    if (room.state.physicsState !== undefined) {
      touchPhysicsState();
    } else {
      room.state.listen('physicsState', touchPhysicsState);
    }
  }

  private setupObservablesPlayerlist(room: Room<GameState>): void {
    const touchPlayerList = () => {
      this.attachToSchemaCollection<Player, MapSchema<Player>>(
        room.state.playerList,
        this.gameState.playerList$,
        () => this.gameState.playerList$.next(room.state.playerList),
        (item: Player) => {
          this.gameState.playerChange$.next(item);
        },
        (item: Player, trigger: () => void) => {
          // only a mapschema of primitives
          if (item.itemList !== undefined) {
            item.itemList.onAdd = trigger;
            item.itemList.onRemove = trigger;
            item.itemList.onChange = trigger;
          } else {
            item.listen('itemList', () => {
              item.itemList.onAdd = trigger;
              item.itemList.onRemove = trigger;
              item.itemList.onChange = trigger;
            });
          }
        }
      );
    };
    if (room.state.playerList !== undefined) {
      touchPlayerList();
    } else {
      room.state.listen('playerList', touchPlayerList);
    }
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
