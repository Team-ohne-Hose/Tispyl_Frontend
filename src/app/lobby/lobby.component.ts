import { Component, OnInit } from '@angular/core';
import {TranslationService} from '../translation.service';
import {User} from '../model/User';
import {Game} from '../model/Game';
import {Translation} from '../model/Translation';
import {Login} from '../model/Login';
import * as hash from '../../../node_modules/object-hash';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {RegisterPopupComponent} from '../register-popup/register-popup.component';
import {OpenGamePopupComponent} from '../open-game-popup/open-game-popup.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  currentUser: User;
  activeGames: Game[] = [];
  translation: Translation;

  dummyDatasource: User[] = [new User('tizian', 'DERGOTT', 'handball')];

  constructor(private dialog: MatDialog) {

  }

  ngOnInit() {
    this.translation = TranslationService.getTranslations('en');
  }

  create() {
    const dialogRef: MatDialogRef<OpenGamePopupComponent, Game> = this.dialog.open(OpenGamePopupComponent,{
      width: '80%',
      maxWidth: '500px',
      height: '30%',
      maxHeight: '250px',
      data: { user: this.currentUser},
      panelClass: 'modalbox-base'
    });

    dialogRef.afterClosed().subscribe(g => {
      this.activeGames.push(g);
    });
  }

  onDelete(g: Game) {
    const index = this.activeGames.indexOf(g, 0);
    if (index > -1) {
      this.activeGames.splice(index, 1);
    }
  }

  changeLanguage(lang: String) {
    this.translation = TranslationService.getTranslations(lang);
  }

  saveNewUser(r: User) {
    console.log('Called registration stub with: ', r);
  }

  login(l) {
    const found = this.dummyDatasource.find( e => e.login === l.name);
    if (found !== undefined && found.password === hash.MD5(l.password)) {
      this.loginAs(l);
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
}
