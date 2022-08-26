/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomAvailable } from 'colyseus.js';
import { Subscription } from 'rxjs';
import { RoomMetaInfo } from 'src/app/model/RoomMetaInfo';
import { ColyseusClientService, CreateRoomOpts } from 'src/app/services/colyseus-client.service';
import { ObjectLoaderService } from 'src/app/services/object-loader/object-loader.service';

@Component({
  selector: 'app-debugdummy',
  templateUrl: './debugdummy.component.html',
  styleUrls: ['./debugdummy.component.css'],
})
export class DebugdummyComponent implements OnInit, OnDestroy {
  static readonly ANON_NAME_PREFIX = 'Anon';
  static readonly ROOM_NAME = 'Debugging Room';
  static readonly TILESET_ID = 1;
  static readonly RAND_TILES = true;
  static readonly ENABLE_ITEMS = true;
  static readonly ENABLE_MULTIPLE_ITEMS = true;
  static readonly CUBE_MAP = 2;

  availableRooms: RoomAvailable<RoomMetaInfo>[] = [];
  displayName = DebugdummyComponent.ANON_NAME_PREFIX;
  loginName = DebugdummyComponent.ANON_NAME_PREFIX;

  // subscriptions
  availableRooms$$: Subscription;

  constructor(private colyseus: ColyseusClientService, private objectLoader: ObjectLoaderService, private router: Router) {}

  ngOnInit(): void {
    this.availableRooms$$ = this.colyseus.availableRooms$.subscribe((availableRooms) => {
      this.availableRooms = availableRooms;
    });
    this.colyseus.updateAvailableRooms();
  }

  ngOnDestroy(): void {
    if (this.availableRooms$$ !== undefined) {
      this.availableRooms$$.unsubscribe();
    }
  }

  setNames() {
    const debugRoom = this.findDebugRoom();
    let id = 0;
    if (debugRoom) {
      id = debugRoom.clients;
    }
    this.loginName = DebugdummyComponent.ANON_NAME_PREFIX + id;
    this.displayName = DebugdummyComponent.ANON_NAME_PREFIX + ' ' + id;
    console.log('setting name to ', this.displayName);
  }

  findDebugRoom(): RoomAvailable<RoomMetaInfo> {
    return this.availableRooms.find((room: RoomAvailable<RoomMetaInfo>) => {
      return room.metadata.roomName === DebugdummyComponent.ROOM_NAME;
    });
  }

  createOrJoin() {
    if (this.findDebugRoom()) {
      this.join();
    } else {
      this.createLobby();
    }
  }

  createLobby() {
    this.setNames();
    console.log('creating lobby');
    const opts: CreateRoomOpts = {
      roomName: DebugdummyComponent.ROOM_NAME,
      author: this.displayName,
      login: this.loginName,
      displayName: this.displayName,
      tileSetId: DebugdummyComponent.TILESET_ID,
      randomizeTiles: DebugdummyComponent.RAND_TILES,
      enableItems: DebugdummyComponent.ENABLE_ITEMS,
      enableMultipleItems: DebugdummyComponent.ENABLE_MULTIPLE_ITEMS,
    };

    this.objectLoader.setCurrentCubeMap(DebugdummyComponent.CUBE_MAP);
    this.colyseus.createRoom(opts);
  }

  join() {
    this.setNames();
    this.colyseus.joinActiveRoom(this.findDebugRoom(), this.loginName, this.displayName);
    this.objectLoader.setCurrentCubeMap(DebugdummyComponent.CUBE_MAP);
    this.router.navigateByUrl('/game');
  }

  backHome() {
    this.router.navigateByUrl('');
  }
}
