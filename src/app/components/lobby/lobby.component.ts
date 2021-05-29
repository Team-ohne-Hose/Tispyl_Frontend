import { Component, OnInit } from '@angular/core';
import { TranslationService, Translation } from '../../services/translation.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OpenGamePopupComponent } from './dialogs/open-game-popup/open-game-popup.component';
import { ColyseusClientService, CreateRoomOpts } from '../../services/colyseus-client.service';
import { Client, Room, RoomAvailable } from 'colyseus.js';
import { Router } from '@angular/router';
import { UserService, LoginUser } from '../../services/user.service';
import { RoomMetaInfo } from '../../model/RoomMetaInfo';
import { JoinGameComponent } from './dialogs/join-game/join-game.component';
import { GameState } from '../../model/state/GameState';
import { environmentList } from './lobbyLUTs';
import { ObjectLoaderService } from '../../services/object-loader.service';

interface DialogResult {
  roomName: string;
  skinName: string;
  randomizeTiles: boolean;
}

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
  currentUser: LoginUser;
  activeLobby: Room<GameState>;
  gameClient: Client;
  availableLobbies: RoomAvailable<RoomMetaInfo>[] = [];

  /** Player settings */
  currentEnvironmentIdx = 0;

  /** Pop-up config */
  dialogConfig = {
    width: '80%',
    maxWidth: '500px',
    height: '70%',
    maxHeight: '350px',
    data: { user: this.currentUser },
    panelClass: 'modalbox-base',
  };

  constructor(
    private dialog: MatDialog,
    private colyseus: ColyseusClientService,
    private objectLoader: ObjectLoaderService,
    private router: Router,
    private userManagement: UserService
  ) {
    this.gameClient = colyseus.getClient();
  }

  ngOnInit() {
    this.userManagement.getActiveUser().subscribe((u) => (this.currentUser = u));
    this.colyseus.getActiveRoom().subscribe((r) => (this.activeLobby = r));
    this.colyseus.availableRooms.subscribe((arr) => (this.availableLobbies = arr));
  }

  changeLanguage(lang: string): void {
    this.translation = TranslationService.getTranslations(lang);
  }

  refresh(): void {
    this.colyseus.updateAvailableRooms();
  }

  isActive(lobby: RoomAvailable<RoomMetaInfo>) {
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
          skin: res.skinName,
          randomizeTiles: res.randomizeTiles,
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
    const currentUser = this.userManagement.activeUser.value;
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
