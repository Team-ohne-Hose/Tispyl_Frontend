import {Component, Input, OnInit} from '@angular/core';
import {TranslationService} from '../translation.service';
import {User} from '../model/User';
import {GameLobby} from '../model/GameLobby';
import {Translation} from '../model/Translation';
import {Login} from '../model/Login';
import * as hash from '../../../node_modules/object-hash';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {OpenGamePopupComponent} from '../open-game-popup/open-game-popup.component';
import {ColyseusClientService} from '../colyseus-client.service';
import {Client} from 'colyseus.js';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  currentUser: User;
  activeGames: GameLobby[] = [];
  translation: Translation;
  gameClient: Client;

  dummyDatasource: User[] = [new User('tizian', 'DERGOTT', 'handball')];

  constructor(private dialog: MatDialog, private colyseus: ColyseusClientService) {
    this.gameClient = colyseus.getClient();
    console.log('Received client: ', this.gameClient);
  }

  ngOnInit() {
    this.translation = TranslationService.getTranslations('en');
  }

  create() {
    const dialogRef: MatDialogRef<OpenGamePopupComponent, GameLobby> = this.dialog.open(OpenGamePopupComponent,{
      width: '80%',
      maxWidth: '500px',
      height: '30%',
      maxHeight: '250px',
      data: { user: this.currentUser},
      panelClass: 'modalbox-base'
    });

    dialogRef.afterClosed().subscribe(g => {
      this.gameClient.create('game', { name: 'EinNamen', author: this.currentUser.display}).then( suc => {
       // if successfull;
        this.loadAvailableGames();
      });
    });
  }

  onDelete(g: GameLobby) {
    const index = this.activeGames.indexOf(g, 0);
    if (index > -1) {
      this.activeGames.splice(index, 1);
    }
  }

  changeLanguage(lang: string) {
    this.translation = TranslationService.getTranslations(lang);
  }

  saveNewUser(r: User) {
    console.log('Called registration stub with: ', r);
  }

  login(l) {
    const found = this.dummyDatasource.find( e => e.login === l.name);
    if (found !== undefined && found.password === hash.MD5(l.password)) {
      this.loginAs(l);
      this.loadAvailableGames();
      console.log('Logged in as ', l);
    } else {
      console.log('Failed to log in:', l);
    }
  }

  private loginAs(l: Login) {
    const usr = Object.assign({}, this.dummyDatasource.find( e => e.login === l.name));
    usr.password = null;
    this.currentUser = usr;
  }

  loadAvailableGames() {
    this.gameClient.getAvailableRooms('game').then( suc => {
      this.activeGames = suc.map(room => {
        // TODO: STRONGLY TYPE THIS RETURN VALUE !!
        const g = new GameLobby(
          room.metadata['lobbyName'],
          room.metadata['author'],
          new Date(room['createdAt']),
          room.roomId,
          room.clients
        );
        console.log(g);
        return g;
      });
    });
  }

}
