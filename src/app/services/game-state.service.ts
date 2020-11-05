import {Injectable} from '@angular/core';
import {ColyseusClientService, MessageCallback} from './colyseus-client.service';
import {Room} from 'colyseus.js';
import {DataChange, MapSchema} from '@colyseus/schema';
import {GameState} from '../model/state/GameState';
import {Player} from '../model/state/Player';
import {PhysicsObjectState, PhysicsState} from '../model/state/PhysicsState';
import {BoardLayoutState} from '../model/state/BoardLayoutState';
import {MessageType} from '../model/WsData';
import {GameInitialisationService} from './game-initialisation.service';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  // This class provides an interface to the colyseus data
  // It provides structures which fit better to the needs when ingame

  private room: Room<GameState>;
  private loaded = true; // TODO is this useful? If so, implement correctly
  private nextTurnCallback: ((activePlayerLogin: string) => void)[] = [];
  private nextActionCallbacks: ((action: string) => void)[] = [];
  private playerListUpdateCallbacks: ((player: Player, key: string, players: MapSchema<Player>) => void)[] = [];
  private physicsCallbacks: ((item: PhysicsObjectState, key: string, state: PhysicsState) => void)[] = [];
  private boardLayoutCallbacks: ((layout: BoardLayoutState) => void)[] = [];
  private voteSystemCallbacks: ((changes: DataChange<any>[]) => void)[] = [];


  activePlayerLogin = '';
  activeAction = '';

  constructor(private colyseus: ColyseusClientService,
              private gameInit: GameInitialisationService) {
    this.colyseus.addOnChangeCallback((changes: DataChange<GameState>[]) => {
      changes.forEach((change: DataChange<any>) => {
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
        }
      });
    });
    colyseus.getActiveRoom().subscribe((room: Room<GameState>) => {
      if (room !== undefined) {
        this.room = room;
        room.onStateChange.once((state) => {
          console.debug('first colyseus Patch recieved');
          this.gameInit.setColyseusReady(this);
        });
        setTimeout(this.attachCallbacks.bind(this), 100, room);
      } else {
        console.error('room was undefined');
      }
    });
  }
  private attachCallbacks(room: Room<GameState>) {
    if (room === undefined) {
      console.warn('GameStateService Callbacks couldnt be attached, Room was undefined!');
    } else {
      if (room.state.playerList === undefined) {
        console.warn('GameStateService Callbacks couldnt be attached, Playerlist was undefined');
      } else {
        room.state.playerList.onChange = this.callPlayerListUpdate.bind(this);
      }
      if (room.state.physicsState === undefined) {
        console.warn('GameStateService Callbacks couldnt be attached, PhysicsState was undefined');
      } else if (room.state.physicsState.objects === undefined) {
        console.warn('GameStateService Callbacks couldnt be attached, PhysicsState.objects was undefined');
      } else {
        room.state.physicsState.objects.onChange = this.callPhysicsUpdate.bind(this);
      }
      if (room.state.boardLayout === undefined) {
        console.warn('GameStateService Callbacks couldnt be attached, BoardLayout was undefined');
      } else {
        room.state.boardLayout.onChange = this.callBoardLayoutUpdate.bind(this);
      }
      if (room.state.voteState === undefined) {
        console.warn('GameStateService Callbacks couldnt be attached, voteState was undefined');
      } else {
        room.state.voteState.onChange = this.callVoteSystemUpdate.bind(this);
      }
      console.debug('attached GameStateServiceCallbacks');
    }
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
  getMe(): Player {
    return this.colyseus.myPlayer;
  }
  getMyFigureId(): number {
    return this.colyseus.myFigureId;
  }

  sendMessage(type: number | string, data: any): void {
    const room = this.getRoom();
    if (room !== undefined) {
      room.send(type, data);
    }
  }

  addNextTurnCallback(f: ((activePlayerLogin: string) => void)): void {
    this.nextTurnCallback.push(f);
  }
  addActionCallback(f: ((action: string) => void)): void {
    this.nextActionCallbacks.push(f);
  }
  addPlayerListUpdateCallback(f: ((item: Player, key: string, players: MapSchema<Player>) => void)): void {
    this.playerListUpdateCallbacks.push(f);
  }
  addPhysicsCallback(f: ((item: PhysicsObjectState, key: string, state: PhysicsState) => void)): void {
    this.physicsCallbacks.push(f);
  }
  addBoardLayoutCallback(f: ((layout: BoardLayoutState) => void)): void {
    this.boardLayoutCallbacks.push(f);
  }
  addVoteSystemCallback(f: ((changes: DataChange<any>[]) => void)): void {
    this.voteSystemCallbacks.push(f);
  }
  registerMessageCallback(type: MessageType, cb: MessageCallback): void {
    this.colyseus.registerMessageCallback(type, cb);
  }

  private callNextTurn() {
    this.nextTurnCallback.forEach(f => f(this.room.state.currentPlayerLogin));
  }
  private callNextAction() {
    this.nextActionCallbacks.forEach(f => f(this.room.state.action));
  }
  private callPlayerListUpdate(player: Player, key: string) {
    this.playerListUpdateCallbacks.forEach(f => f(player, key, this.room.state.playerList));
  }
  private callPhysicsUpdate(item: PhysicsObjectState, key: string) {
    this.physicsCallbacks.forEach(f => f(item, key, this.room.state.physicsState));
  }
  private callBoardLayoutUpdate() {
    this.boardLayoutCallbacks.forEach(f => f(this.room.state.boardLayout));
  }
  private callVoteSystemUpdate(changes: DataChange<any>[]) {
    this.voteSystemCallbacks.forEach(f => f(changes));
  }

  getDisplayName(playerlogin: string): string {
    const state = this.getState();
    if (state === undefined) {
      return undefined;
    }
    const player = Array.from(state.playerList.values()).find(p => {
      return p.loginName === playerlogin;
    });
    if (player !== undefined) {
      return player.displayName;
    }
    return undefined;
  }

  getLoginName(playerDisplayName: string): string {
    const state = this.getState();
    if (state === undefined) {
      return undefined;
    }
    const player = Array.from(state.playerList.values()).find(p => {
      return p.displayName === playerDisplayName;
    });
    if (player !== undefined) {
      return player.loginName;
    }
    console.info('Could not find loginName corresponding to displayName: ', playerDisplayName);
    return undefined;
  }
}
