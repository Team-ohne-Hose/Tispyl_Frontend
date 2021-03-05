import { Injectable } from "@angular/core";
import { Player } from "../model/state/Player";

@Injectable({
    providedIn: 'root'
  })
  export class PLayerService {

    playerList: Player[];

  }

    