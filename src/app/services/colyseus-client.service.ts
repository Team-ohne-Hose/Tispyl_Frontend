import { Injectable } from '@angular/core';
import {Client, Room, RoomAvailable} from 'colyseus.js';
import {BehaviorSubject, Observable} from 'rxjs';
import {RoomMetaInfo} from '../model/RoomMetaInfo';


@Injectable({
  providedIn: 'root'
})
export class ColyseusClientService {

  private port = '2567';
  private backendWStarget = 'ws://localhost:' + this.port;

  private client: Client = new Client(this.backendWStarget);
  private activeRoom: BehaviorSubject<Room>;
  private availableRooms: BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>;

  constructor() {
    this.activeRoom = new BehaviorSubject<Room>(undefined);
    this.availableRooms = new BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>([]);
  }

  getClient(): Client {
    return this.client;
  }

  getActiveRoom(): Observable<Room> {
    return this.activeRoom.asObservable();
  }

  setActiveRoom(room): void {
    this.activeRoom.next(room);
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
      console.log(suc);
    });
  }
}
