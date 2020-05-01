import { Component, OnInit } from '@angular/core';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {GameActionType, MessageType} from '../../model/WsData';

@Component({
  selector: 'app-next-turn-button',
  templateUrl: './next-turn-button.component.html',
  styleUrls: ['./next-turn-button.component.css']
})
export class NextTurnButtonComponent implements OnInit {
  hidden = true;

  constructor(private colyseus: ColyseusClientService) { }

  ngOnInit(): void {
    this.colyseus.onRoundChangeCallback.push(this.checkTurn.bind(this));
  }

  checkTurn(activePlayerLogin: string) {
    console.log('nextRound arrived', this.colyseus.myLoginName === activePlayerLogin);
    if (this.colyseus.myLoginName === activePlayerLogin) {
      this.hidden = false;
    } else {
      this.hidden = true;
    }
  }

  nextTurn( event ) {
    console.log('clicked Next');
    this.colyseus.getActiveRoom().subscribe( r => {
      if (r.state.action !== 'EXECUTE') {
        console.log('skipping actions..');
      }
      console.log('next Turn');
      r.send({type: MessageType.GAME_MESSAGE, action: GameActionType.advanceTurn});
    });
  }

}
