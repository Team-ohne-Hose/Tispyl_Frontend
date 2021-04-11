import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { Translation } from '../../services/translation.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OpenGamePopupComponent } from './dialogs/open-game-popup/open-game-popup.component';
import { ColyseusClientService } from '../../services/colyseus-client.service';
import { Client, Room, RoomAvailable } from 'colyseus.js';
import { Router } from '@angular/router';
import { UserService, LoginUser } from '../../services/user.service';
import { RoomMetaInfo } from '../../model/RoomMetaInfo';
import { JoinGameComponent } from './dialogs/join-game/join-game.component';
import { GameState } from '../../model/state/GameState';
import { ProfileDisplayComponent } from './profile-display/profile-display.component';
import { JwtTokenService } from '../../services/jwttoken.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  activeLobby: Room<GameState>;
  gameClient: Client;

  availableLobbies: RoomAvailable<RoomMetaInfo>[] = [];

  translation: Translation = TranslationService.getTranslations('en');

  @ViewChild('profileDisplay') profileDisplay: ProfileDisplayComponent;

  constructor(
    private dialog: MatDialog,
    private colyseus: ColyseusClientService,
    private router: Router,
    private AuthService: JwtTokenService,
    public userManagement: UserService) {
    this.gameClient = colyseus.getClient();
  }

  ngOnInit() {

    if (this.AuthService.isLoggedIn) {
      this.userManagement.getUserByLoginName(localStorage.getItem('username')).subscribe(userResponse => {
        this.userManagement.setActiveUser(userResponse.payload as LoginUser);
      });

    } else {
      this.AuthService.logout();
    }

    // TODO: shouldnt query user here oninit before login
    this.userManagement.getActiveUser().subscribe(u => {
      console.log('USER: ', u);
      if (u !== undefined) {
        this.refresh();
      }
    });
    this.colyseus.getActiveRoom().subscribe(r => this.activeLobby = r);
    this.colyseus.watchAvailableRooms().subscribe(arr => this.availableLobbies = arr);
  }

  create() { // TODO: CLEAN THIS UP !
    const dialogRef: MatDialogRef<OpenGamePopupComponent, { roomName: string, skinName: string, randomizeTiles: boolean }> =
      this.dialog.open(OpenGamePopupComponent, {
        width: '80%',
        maxWidth: '500px',
        height: '70%',
        maxHeight: '350px',
        data: {user: this.userManagement.activeUser.value},
        panelClass: 'modalbox-base'
      });

    dialogRef.afterClosed().subscribe(results => {
      if (results !== undefined) {
        const currentUser = this.userManagement.activeUser.value;
        this.colyseus.createRoom(results.roomName,
          currentUser.display_name,
          currentUser.login_name,
          currentUser.display_name,
          results.skinName,
          results.randomizeTiles);
      } else {
        console.log('closed Dialog without result');
      }
    });
  }

  onLeaveLobby( event ) {
    this.activeLobby.leave(true);
    this.colyseus.setActiveRoom(undefined);
    this.colyseus.updateAvailableRooms();
  }

  isActive(lobby: RoomAvailable<RoomMetaInfo>) {
    return this.activeLobby ? this.activeLobby.id === lobby.roomId : false;
  }

  joinGame(lobby: RoomAvailable<RoomMetaInfo>) {
    const dialogRef: MatDialogRef<JoinGameComponent, void> = this.dialog.open(JoinGameComponent, {
      width: '60%',
      maxWidth: '400px',
      data: {lobby: lobby, lobbyComponent: this},
      panelClass: 'modalbox-base'
    });

    dialogRef.afterClosed().subscribe(s => console.log('closed dialog'));
    const currentUser = this.userManagement.activeUser.value;
    this.colyseus.joinActiveRoom(lobby, currentUser.login_name, currentUser.display_name);
  }

  changeLanguage(lang: string) {
    this.translation = TranslationService.getTranslations(lang);
  }

  refresh() {
    this.colyseus.updateAvailableRooms();
  }

  onEnterGame() {
    this.profileDisplay.setGameSettings();
  }
}
