import { Component, OnInit } from '@angular/core';
import { TranslationService, Translation } from '../../services/translation/translation.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OpenGamePopupComponent } from './dialogs/open-game-popup/open-game-popup.component';
import { ColyseusClientService, CreateRoomOpts } from '../../services/colyseus-client.service';
import { Client, Room, RoomAvailable } from 'colyseus.js';
import { BasicUser, UserService } from '../../services/user.service';
import { RoomMetaInfo } from '../../model/RoomMetaInfo';
import { JoinGameComponent } from './dialogs/join-game/join-game.component';
import { GameState } from '../../model/state/GameState';
import { environmentList } from './lobbyLUTs';
import { ObjectLoaderService } from '../../services/object-loader.service';
import { DialogResult } from './dialogs/open-game-popup/open-game-popup.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
})
export class LobbyComponent implements OnInit {
  /** General constants */
  translation: Translation = TranslationService.getTranslations('en');
  environments = environmentList;

  /** Game room & Colyseus values */
  currentUser: BasicUser;
  activeLobby: Room<GameState>;
  gameClient: Client;
  availableRooms: RoomAvailable<RoomMetaInfo>[] = [];

  /** Player settings */
  currentEnvironmentIdx = 0;

  /** Pop-up config */
  dialogConfig = {
    width: '80%',
    maxWidth: '1000px',
    height: '70%',
    maxHeight: '900px',
    data: {},
    panelClass: 'modalbox-base',
  };

  constructor(
    private dialog: MatDialog,
    private colyseus: ColyseusClientService,
    private objectLoader: ObjectLoaderService,
    private userService: UserService
  ) {
    this.gameClient = colyseus.getClient();
  }

  ngOnInit(): void {
    // Set current user
    this.userService.activeUser.subscribe((user) => {
      this.currentUser = user;
    });

    this.colyseus.getActiveRoom().subscribe((room) => {
      this.activeLobby = room;
    });

    this.colyseus.availableRooms.subscribe((availableRooms) => {
      this.availableRooms = availableRooms;
    });
    this.refetchGameRooms();
  }

  changeLanguage(lang: string): void {
    this.translation = TranslationService.getTranslations(lang);
  }

  refetchGameRooms(): void {
    this.colyseus.updateAvailableRooms();
  }

  isActive(lobby: RoomAvailable<RoomMetaInfo>): boolean {
    return this.activeLobby ? this.activeLobby.id === lobby.roomId : false;
  }

  nextEnvironment(direction: 'left' | 'right'): void {
    const value = this.currentEnvironmentIdx + (direction === 'right' ? 1 : -1);
    if (value < this.environments.length && value >= 0) {
      this.currentEnvironmentIdx = value;
    }
  }

  prepareGameConfiguration(): void {
    this.objectLoader.setCurrentCubeMap(this.currentEnvironmentIdx);
  }

  /** Host a new game */
  createGame(): void {
    const dialogRef: MatDialogRef<OpenGamePopupComponent, DialogResult> = this.dialog.open(
      OpenGamePopupComponent,
      this.dialogConfig
    );

    dialogRef.afterClosed().subscribe((res: DialogResult) => {
      if (res !== undefined) {
        const opts: CreateRoomOpts = {
          roomName: res.roomName,
          author: this.currentUser.display_name,
          login: this.currentUser.login_name,
          displayName: this.currentUser.display_name,
          tileSetId: res.tileSetId,
          randomizeTiles: res.randomizeTiles,
          enableItems: res.enableItems,
          enableMultipleItems: res.enableMultipleItems,
        };

        this.prepareGameConfiguration();
        this.colyseus.createRoom(opts);
      } else {
        console.log('closed Dialog without result');
      }
    });
  }

  /** Join a game you did not previously belong to */
  onJoinGame(lobby: RoomAvailable<RoomMetaInfo>): void {
    this.prepareGameConfiguration();
    const dialogRef: MatDialogRef<JoinGameComponent, void> = this.dialog.open(JoinGameComponent, {
      width: '60%',
      maxWidth: '400px',
      data: { lobby: lobby, lobbyComponent: this },
      panelClass: 'modalbox-base',
    });
    dialogRef.afterClosed().subscribe((s) => console.log('closed dialog'));
    const currentUser = this.userService.activeUser.value;
    this.colyseus.joinActiveRoom(lobby, currentUser.login_name, currentUser.display_name);
  }

  /** Enter a game (switch to in game view) you are already assigned to */
  onEnterGame(): void {
    this.prepareGameConfiguration();
  }

  /** Leave a game you are currently assigned to */
  onLeaveGame(): void {
    this.activeLobby.leave(true);
    this.colyseus.setActiveRoom(undefined);
    this.colyseus.updateAvailableRooms();
  }
}
