import { Injectable } from '@angular/core';
import {Client, Room, RoomAvailable} from 'colyseus.js';
import {BehaviorSubject, Observable} from 'rxjs';
import {RoomMetaInfo} from '../model/RoomMetaInfo';
import {room} from 'colyseus.js/lib/sync/helpers';
import {GameState} from '../model/GameState';


@Injectable({
  providedIn: 'root'
})
export class ColyseusClientService {

  private port = '2567';
  private backendWStarget = 'ws://localhost:' + this.port;

  private client: Client = new Client(this.backendWStarget);
  private activeRoom: BehaviorSubject<Room<GameState>>;
  private availableRooms: BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>;

  private chatCallback: (data: any) => void;

  constructor() {
    this.activeRoom = new BehaviorSubject<Room<GameState>>(undefined);
    this.availableRooms = new BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>([]);
  }

  getClient(): Client {
    return this.client;
  }

  getActiveRoom(): Observable<Room<GameState>> {
    return this.activeRoom.asObservable();
  }

  setActiveRoom(newRoom): void {
    if (newRoom !== undefined) {
      this.attatchRegisteredCallbacks(newRoom);
    }
    this.activeRoom.next(newRoom);
  }

  joinActiveRoom(roomAva: RoomAvailable<RoomMetaInfo>, options?: any) {
    this.client.joinById(roomAva.roomId, options).then((myRoom) => {
      this.setActiveRoom(myRoom);
    });
  }

  watchAvailableRooms(): Observable<RoomAvailable<RoomMetaInfo>[]> {
    return this.availableRooms.asObservable();
  }

  updateAvailableRooms(): void {
    this.client.getAvailableRooms('game').then( rooms => {
      this.availableRooms.next(rooms);
    });
  }

  hostGame(opt): void {
    this.client.create('game', opt).then( suc => {
      this.setActiveRoom(suc);
    });
  }


  /**
   * If this happens while hosting a game without initializing the ingame chat. This will happen once.
   * @param data
   */
  private defaultCallback(data) {
    console.log('call back was undefined', data);
  }

  setChatCallback(f: (data: any) => void): void {
    this.chatCallback = f;

    if (f !== undefined) {
      this.getActiveRoom().subscribe((r) => {
        if (r !== undefined) {
          r.onMessage(this.chatCallback || this.defaultCallback);
        }
      });
    }
  }

  attatchRegisteredCallbacks(roomToAttatch: Room): Room {
    roomToAttatch.onMessage(this.chatCallback || this.defaultCallback);
    return roomToAttatch;
  }
}
