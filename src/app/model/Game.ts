
import {Player} from './Player';

export class Game {

  constructor(name: String, author: String){
    this.name = name;
    this.author = author;
    this.creationDate = Date.now();
  }

  name: String;
  author: String;
  creationDate: number;
  players: Player[];
}
