import { Component } from '@angular/core';
import {activateRoutes} from '@angular/router/src/operators/activate_routes';
import { Game} from 'src/app/model/Game';
import { Player} from 'src/app/model/Player';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  activeGames: Game[] = [];
  players: Player[] = [];

  create() {
    this.activeGames.push(new Game('Mein Game :D', 'Tizian Rettig'))
  }

  onDelete(g: Game) {
    const index = this.activeGames.indexOf(g, 0);
    if (index > -1) {
      this.activeGames.splice(index, 1);
    }
  }
}
