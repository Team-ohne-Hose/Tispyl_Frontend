import { Injectable } from '@angular/core';
import { Player } from '../model/state/Player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  playerList: Player[];

}

