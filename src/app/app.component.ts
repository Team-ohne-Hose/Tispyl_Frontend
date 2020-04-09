import { Component, OnInit } from '@angular/core';
import {activateRoutes} from '@angular/router/src/operators/activate_routes';
import { Component } from '@angular/core';
import { Game} from 'src/app/model/Game';
import { Player} from 'src/app/model/Player';
import { TranslationService } from 'src/app/translation.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  activeGames: Game[] = [];
  players: Player[] = [new Player("tizian"), new Player("liebler"), new Player("liebler")];
  translation: { };

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
}
