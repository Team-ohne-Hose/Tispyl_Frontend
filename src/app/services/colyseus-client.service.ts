import { Injectable } from '@angular/core';
import {Client, Room, RoomAvailable} from 'colyseus.js';
import {BehaviorSubject, Observable} from 'rxjs';
import {RoomMetaInfo} from '../model/RoomMetaInfo';
import {room} from 'colyseus.js/lib/sync/helpers';


@Injectable({
  providedIn: 'root'
})
export class ColyseusClientService {

  private port = '2567';
  private backendWStarget = 'ws://localhost:' + this.port;

  private client: Client = new Client(this.backendWStarget);
  private activeRoom: BehaviorSubject<Room>;
  private availableRooms: BehaviorSubject<RoomAvailable<RoomMetaInfo>[]>;

  private chatCallback: (data: any) => void;

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
    const extendedRoom = this.attatchRoomCallbacks(room);
    this.activeRoom.next(room);
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

  private defaultCallback(data) {
    console.log('cb was undefined', data);
  }

  setChatCallback(f: (data: any) => void): void {
    this.chatCallback = f;
    this.getActiveRoom().subscribe((myRoom) => {
      myRoom.onMessage(this.chatCallback || this.defaultCallback);
    });
  }

  attatchRoomCallbacks(roomToAttatch: Room): Room {
    roomToAttatch.onMessage(this.chatCallback || this.defaultCallback);
    return roomToAttatch;
  }
}
