import { Component, OnInit } from '@angular/core';
import { Game} from 'src/app/model/Game';
import { Player} from 'src/app/model/Player';
import { TranslationService } from 'src/app/translation.service';
import {Translation} from './model/Translation';
import {User} from './model/User';
import * as hash from 'object-hash'
import {Login} from './model/Login';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  currentUser: User;
  activeGames: Game[] = [];
  translation: Translation;

  dummyDatasource: User[] = [new User("tizian", "DERGOTT", "handball")];

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
    console.log("Called registration stub with: ", r)
  }

  login(l) {
    let found = this.dummyDatasource
      .find( e => e.login === l.name)

    if (found != undefined && found.password === hash.MD5(l.password)) {
      this.loginAs(l)
    } else {
      console.log("Failed to log in:", l)
    }
  }

  private loginAs(l: Login) {
    let usr = this.dummyDatasource.find( e => e.login === l.name)
    usr.password = null
    this.currentUser = usr
    console.log("Logged in as:", this.currentUser)
  }
}
