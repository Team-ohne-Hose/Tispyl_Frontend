import { Component, OnInit } from '@angular/core';
import {TranslationService} from '../translation.service';
import {User} from '../model/User';
import {Game} from '../model/Game';
import {Translation} from '../model/Translation';
import {Login} from '../model/Login';
import * as hash from 'object-hash';


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

  ngOnInit() {
    this.translation = TranslationService.getTranslations('en');
  }

  create() {
    this.activeGames.push(new Game('Mein Game :D', 'Tizian Rettig'))
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
    const found = this.dummyDatasource
      .find( e => e.login === l.name);

    if (found !== undefined && found.password === hash.MD5(l.password)) {
      this.loginAs(l);
    } else {
      console.log('Failed to log in:', l);
    }
  }

  private loginAs(l: Login) {
    const usr = this.dummyDatasource.find( e => e.login === l.name);
    usr.password = null;
    this.currentUser = usr;
    console.log('Logged in as:', this.currentUser);
  }
}
