import { Injectable } from '@angular/core';
import {Client, Room} from 'colyseus.js';


@Injectable({
  providedIn: 'root'
})
export class ColyseusClientService {

  private port = '2567'
  private backendWStarget = 'ws://localhost:' + this.port;

  private client: Client = new Client(this.backendWStarget);

  constructor() { }

  getClient(): Client {
    return this.client;
  }
}
