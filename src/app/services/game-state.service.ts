import { Injectable } from '@angular/core';
import { ColyseusClientService, MessageCallback } from './colyseus-client.service';
import { Room } from 'colyseus.js';
import { DataChange, MapSchema, ArraySchema } from '@colyseus/schema';
import { GameState } from '../model/state/GameState';
import { Player } from '../model/state/Player';
import { PhysicsObjectState, PhysicsState } from '../model/state/PhysicsState';
import { BoardLayoutState, Tile } from '../model/state/BoardLayoutState';
import { MessageType } from '../model/WsData';
import { VoteStage, VoteState } from '../model/state/VoteState';
import { VoteEntry } from '../components/game/interface/menu-bar/vote-system/helpers/VoteEntry';
import { AsyncSubject, BehaviorSubject, Observable, Subject } from 'rxjs';
import { Rule } from '../model/state/Rule';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  // This class provides an interface to the colyseus data
  // It provides structures which fit better to the needs when ingame

  isColyseusReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  me: AsyncSubject<Player> = new AsyncSubject<Player>();
  currentHostLogin: Subject<string> = new Subject<string>();

  activePlayerLogin = '';
  activeAction = '';

  private room: Room<GameState>;
  private loaded = false;
  private nextTurnCallback: ((activePlayerLogin: string) => void)[] = [];
  private nextActionCallbacks: ((action: string) => void)[] = [];
  private playerListUpdateCallbacks: ((player: Player, key: string, players: MapSchema<Player>) => void)[] = [];
  private physicsObjectsMovedCallbacks: ((item: PhysicsObjectState, key: string) => void)[] = [];
  private boardLayoutCallbacks: ((layout: BoardLayoutState) => void)[] = [];
  private voteStageCallbacks: ((stage: VoteStage) => void)[] = [];
  private voteCastCallbacks: (() => void)[] = [];
  private voteSystemCallbacks: ((change: DataChange[]) => void)[] = [];
  private itemCallbacks: (() => void)[] = [];

  constructor(private colyseus: ColyseusClientService) {
    this.colyseus.addOnChangeCallback((changes: DataChange<GameState>[]) => {
      changes.forEach((change: DataChange) => {
        switch (change.field) {
          case 'currentPlayerLogin':
            console.debug('nextTurn detected. notifying callbacks');
            this.callNextTurn();
            if (this.activePlayerLogin !== change.value) {
              this.activePlayerLogin = change.value;
            }
            break;
          case 'action':
            this.activeAction = change.value;
            this.callNextAction();
            break;
          case 'playerList': {
            if (!this.me.isStopped) {
              this.me.next(this._resolveMyPlayerObject(change.value as MapSchema<Player>));
              this.me.complete();
            }
            break;
          }
          case 'hostLoginName':
            this.currentHostLogin.next(change.value);
            break;
        }
      });
    });
    colyseus.getActiveRoom().subscribe((room: Room<GameState>) => {
      if (room !== undefined) {
        this.room = room;
        room.onStateChange.once((state) => {
          console.debug('first colyseus Patch recieved');
          this.loaded = true;
          this.isColyseusReady.next(true);
          setTimeout(this.attachCallbacks.bind(this), 100, room);
        });
      } else {
        console.error('room was undefined');
      }
    });
  }

  private _resolveMyPlayerObject(players: MapSchema<Player>): Player {
    return Array.from(players.values()).find((p: Player) => {
      return p.loginName === this.colyseus.myLoginName;
    });
  }

  amIHost(): Observable<boolean> {
    return this.currentHostLogin.pipe(
      mergeMap((hostLogin: string) => {
        return this.me.pipe(map((me: Player) => hostLogin === me.loginName));
      })
    );
  }

  isGameLoaded(): boolean {
    return this.loaded;
  }

  getRoom(): Room<GameState> {
    return this.loaded ? this.room : undefined;
  }

  getState(): GameState {
    const room = this.getRoom();
    if (room === undefined || room.state === undefined) {
      return undefined;
    } else {
      return room.state;
    }
  }

  isMyTurn(): boolean {
    return this.room === undefined ? false : this.room.state.currentPlayerLogin === this.getMyLoginName();
  }

  getMyLoginName(): string {
    return this.colyseus.myLoginName;
  }

  getMyFigureId(): number {
    const p: Player = this.getByLoginName(this.colyseus.myLoginName);
    return p.figureId;
  }

  findInPlayerList(f: (p: Player) => boolean): Player {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return Array.from(s.playerList.values()).find(f);
    }
  }

  getMe(): Player {
    return this.getByLoginName(this.colyseus.myLoginName);
  }

  getCurrentPlayer(): Player {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return this.getByLoginName(s.currentPlayerLogin);
    }
    return undefined;
  }

  getCurrentPlayerLogin(): string {
    const p: Player = this.getCurrentPlayer();
    if (p !== undefined) {
      return p.loginName;
    }
    return '';
  }

  getCurrentPlayerDisplayName(): string {
    const p: Player = this.getCurrentPlayer();
    if (p !== undefined) {
      return p.displayName;
    }
    return '';
  }

  getByLoginName(loginName: string): Player {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return s.playerList.get(loginName);
    }
  }

  getByDisplayName(displayName: string): Player {
    return this.findInPlayerList((p: Player) => {
      return p.displayName === displayName;
    });
  }

  getDisplayName(playerlogin: string): string {
    const p: Player = this.getByLoginName(playerlogin);
    if (p !== undefined) {
      return p.displayName;
    }
    return undefined;
  }

  getLoginName(playerDisplayName: string): string {
    const p: Player = this.getByDisplayName(playerDisplayName);
    if (p !== undefined) {
      return p.loginName;
    }
    return undefined;
  }

  getRound(): number {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return s.round;
    }
    return 0;
  }

  getAction(): string {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return s.action;
    }
    return undefined;
  }

  hasStarted(): boolean {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return s.hasStarted;
    }
    return false;
  }

  getPlayerArray(): Player[] {
    const s: GameState = this.getState();
    if (s !== undefined) {
      return Array.from(s.playerList.values());
    }
    return [];
  }

  forEachPlayer(f: (p: Player) => void): void {
    const s: GameState = this.getState();
    s?.playerList?.forEach(f);
  }

  getRules(): ArraySchema<Rule> | undefined {
    const s: GameState = this.getState();
    return s?.rules;
  }

  getVoteState(): VoteState | undefined {
    const s: GameState = this.getState();
    return s?.voteState;
  }

  getPhysicsState(): PhysicsState | undefined {
    const s = this.getState();
    return s?.physicsState;
  }

  getBoardLayoutAsArray(): Tile[] {
    const s: GameState = this.getState();
    if (s !== undefined) {
      const tiles: Tile[] = [];
      for (let i = 0; i < 64; i++) {
        tiles.push(s.boardLayout.tileList.get(String(i)));
      }
      return tiles;
    }
    return [];
  }

  sendMessage(type: number | string, data: unknown): void {
    const room = this.getRoom();
    if (room !== undefined) {
      room.send(type, data);
    }
  }

  addNextTurnCallback(f: (activePlayerLogin: string) => void): void {
    this.nextTurnCallback.push(f);
  }

  addActionCallback(f: (action: string) => void): void {
    this.nextActionCallbacks.push(f);
  }

  addPlayerListUpdateCallback(f: (item: Player, key: string, players: MapSchema<Player>) => void): void {
    this.playerListUpdateCallbacks.push(f);
  }

  addPhysicsObjectMovedCallback(f: (item: PhysicsObjectState, key: string) => void): void {
    this.physicsObjectsMovedCallbacks.push(f);
  }

  addBoardLayoutCallback(f: (layout: BoardLayoutState) => void): void {
    this.boardLayoutCallbacks.push(f);
  }

  addVoteStageCallback(f: (stage: VoteStage) => void): void {
    this.voteStageCallbacks.push(f);
  }

  addVoteCastCallback(f: () => void): void {
    this.voteCastCallbacks.push(f);
  }

  addVoteSystemCallback(f: (change: DataChange[]) => void): void {
    this.voteSystemCallbacks.push(f);
  }

  addItemUpdateCallback(f: () => void): void {
    this.itemCallbacks.push(f);
  }

  registerMessageCallback(type: MessageType, cb: MessageCallback): void {
    this.colyseus.registerMessageCallback(type, cb);
  }

  private attachPlayerCallbacks(room: Room<GameState>): void {
    if (room.state.playerList === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, Playerlist was undefined');
    } else {
      const addPlayerCbs = (p: Player, key: string) => {
        p.onChange = ((changes: DataChange[]) => {
          this.callPlayerListUpdate(p, key);
        }).bind(this);
      };
      room.state.playerList.onAdd = (p: Player, key: string) => {
        addPlayerCbs(p, key);
        this.callPlayerListUpdate(p, key);
      };
      room.state.playerList.forEach((p: Player, key: string) => {
        addPlayerCbs(p, key);
        this.callPlayerListUpdate(p, key);
      });
    }
  }

  private attachPhysicsMovedCallbacks(room: Room<GameState>): void {
    if (room.state.physicsState === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, PhysicsState was undefined');
    } else if (room.state.physicsState.objects === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, PhysicsState.objects was undefined');
    } else {
      console.debug('PhysicsUpdates attached', room, room.state, room.state.physicsState.objects);
      const attachMovedCallbacks = (pObj: PhysicsObjectState, key: string) => {
        console.debug('attached onChange Callback to physics object', pObj);
        pObj.position.onChange = ((changes: DataChange[]) => {
          this.callPhysicsObjectMoved(pObj, key);
        }).bind(this);
        pObj.quaternion.onChange = ((changes: DataChange[]) => {
          this.callPhysicsObjectMoved(pObj, key);
        }).bind(this);
      };
      room.state.physicsState.objects.forEach(attachMovedCallbacks.bind(this));
      room.state.physicsState.objects.onAdd = ((item, key) => {
        console.debug('onAdd triggered', item, key);
        attachMovedCallbacks(item, key);
        this.callPhysicsObjectMoved(item, key);
      }).bind(this);
    }
  }

  private attachBoardLayoutCallbacks(room: Room<GameState>): void {
    if (room.state.boardLayout === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, BoardLayout was undefined');
    } else {
      const boardLayoutCallbacks = (t: Tile, key: string) => {
        t.onChange = ((changes: DataChange[]) => {
          this.callBoardLayoutUpdate();
        }).bind(this);
      };
      room.state.boardLayout.tileList.forEach(boardLayoutCallbacks.bind(this));
      room.state.boardLayout.tileList.onAdd = ((item, key) => {
        boardLayoutCallbacks(item, key);
        this.callBoardLayoutUpdate();
      }).bind(this);
    }
  }

  private attachVoteStateCallbacks(room: Room<GameState>): void {
    if (room.state.voteState === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, voteState was undefined');
    } else {
      room.state.voteState.onChange = this.callVoteStageUpdate.bind(this);
    }
  }

  private attachVoteCastCallback(): void {
    if (this.room?.state?.voteState?.voteConfiguration === undefined) {
      console.warn(
        'GameStateService tried to attach callbacks for casting votes. Something was not defined. Room is:',
        this.room
      );
      return;
    }
    // this should get called everytime a new Vote is started.
    // it attaches the callVoteCastUpdate to every voting option. For every casted/changed vote, the old entry is removed and a new entry
    // in the corresponding option is added for the player, which just casted the vote. Therefore the onAdd callback should be sufficient.
    this.room.state.voteState.voteConfiguration.votingOptions.forEach((entry: VoteEntry) => {
      entry.castVotes.onAdd = this.callVoteCastUpdate.bind(this);
    });
  }

  private attachItemCallback(room: Room<GameState>): void {
    const playerMe: Player = this.getMe();
    if (playerMe?.itemList === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, playerMe or its ItemList was undefined');
    } else {
      // onChange works only on Arrays/Maps of primitives. But ItemList is a primitive
      playerMe.itemList.onChange = this.callItemUpdate.bind(this);
      playerMe.itemList.onAdd = this.callItemUpdate.bind(this);
      playerMe.itemList.onRemove = this.callItemUpdate.bind(this);
    }
  }

  private attachCallbacks(room: Room<GameState>): void {
    if (room === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, Room was undefined!');
    } else {
      this.attachPlayerCallbacks(room);
      this.attachPhysicsMovedCallbacks(room);
      this.attachBoardLayoutCallbacks(room);
      this.attachVoteStateCallbacks(room);
      this.attachItemCallback(room);
      console.debug('attached GameStateServiceCallbacks');
    }
  }

  private callNextTurn(): void {
    this.nextTurnCallback.forEach((f) => f(this.room.state.currentPlayerLogin));
  }

  private callNextAction(): void {
    this.nextActionCallbacks.forEach((f) => f(this.room.state.action));
  }

  private callPlayerListUpdate(player: Player, key: string): void {
    this.playerListUpdateCallbacks.forEach((f) => f(player, key, this.room.state.playerList));
  }

  private callPhysicsObjectMoved(item: PhysicsObjectState, key: string): void {
    this.physicsObjectsMovedCallbacks.forEach((f) => f(item, key));
  }

  private callBoardLayoutUpdate(): void {
    this.boardLayoutCallbacks.forEach((f) => f(this.room.state.boardLayout));
  }

  private callVoteStageUpdate(changes: DataChange[]): void {
    const newVal: VoteStage = changes.find((change: DataChange) => change.field === 'voteStage')?.value;
    if (newVal !== undefined) {
      this.voteStageCallbacks.forEach((f) => f(newVal));
    }
    if (newVal === VoteStage.VOTE) {
      this.attachVoteCastCallback();
    }
    this.voteSystemCallbacks.forEach((f) => f(changes.filter((v: DataChange) => v.field !== 'voteStage')));
  }

  private callVoteCastUpdate(): void {
    this.voteCastCallbacks.forEach((f) => f());
  }

  private callItemUpdate(): void {
    this.itemCallbacks.forEach((f) => f());
  }
}
