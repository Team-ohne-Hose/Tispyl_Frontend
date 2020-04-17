import { Component, OnInit} from '@angular/core';
import {TranslationService} from '../services/translation.service';
import {User} from '../model/User';
import {GameLobby} from '../model/GameLobby';
import {Translation} from '../model/Translation';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {OpenGamePopupComponent} from './dialogs/open-game-popup/open-game-popup.component';
import {ColyseusClientService} from '../services/colyseus-client.service';
import {Client, Room, RoomAvailable} from 'colyseus.js';
import { Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {RoomMetaInfo} from '../model/RoomMetaInfo';
import {JoinGameComponent} from './dialogs/join-game/join-game.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  currentUser: User;
  activeLobby: Room<RoomMetaInfo>;
  gameClient: Client;

  availableLobbies: RoomAvailable<RoomMetaInfo>[] = [];

  translation: Translation;

  constructor(
    private dialog: MatDialog,
    private colyseus: ColyseusClientService,
    private router: Router,
    private userManagement: UserService) {
    this.gameClient = colyseus.getClient();
  }

  ngOnInit() {
    // enable scrollbars
    document.documentElement.setAttribute('style', 'overflow: scrollbars');
    this.translation = TranslationService.getTranslations('en');

    this.userManagement.getActiveUser().subscribe( u => this.currentUser = u);
    this.colyseus.getActiveRoom().subscribe( r => this.activeLobby = r);
    this.colyseus.watchAvailableRooms().subscribe( arr => this.availableLobbies = arr);
  }

  create() { // TODO: CLEAN THIS UP !
    const dialogRef: MatDialogRef<OpenGamePopupComponent, string> = this.dialog.open(OpenGamePopupComponent, {
      width: '80%',
      maxWidth: '500px',
      height: '30%',
      maxHeight: '250px',
      data: { user: this.currentUser},
      panelClass: 'modalbox-base'
    });

    dialogRef.afterClosed().subscribe(s => {
      if (s !== undefined) {
        this.colyseus.hostGame({name: s, author: this.currentUser.display_name, displayName: this.currentUser.display_name});
        this.colyseus.updateAvailableRooms();
        // this.router.navigateByUrl('/game')
        //  .then(e => {
        //    console.log('Routed =)', e);
        //  });
      }});
  }

  onLeaveLobby() {
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
      data: {lobby: lobby},
      panelClass: 'modalbox-base'
    });

    dialogRef.afterClosed().subscribe(s => console.log('closed dialog'));
    console.log('JOIN STUB: ', lobby);
    this.colyseus.joinActiveRoom(lobby, {displayName: this.currentUser.display_name});
  }

  changeLanguage(lang: string) {
    this.translation = TranslationService.getTranslations(lang);
  }

  refresh() {
    this.colyseus.updateAvailableRooms();
  }
}
