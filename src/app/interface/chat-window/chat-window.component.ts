import { Component, OnInit } from '@angular/core';
import {ColyseusClientService} from '../../services/colyseus-client.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  constructor( private colyseus: ColyseusClientService) { }

  currentMessage = '';
  chatContent = '';

  ngOnInit(): void {
    this.colyseus.setChatCallback(data => {
      this.chatContent =  this.chatContent + '\n' + data.content.message;
    });

    // SOME DEBUG INIT CODE
    /*this.colyseus.getClient().create('game').then( room => {
      console.log('room: ', room);
      this.colyseus.setActiveRoom(room);

      /*this.colyseus.setActiveRoom(room);
        room.onMessage( data => {
          this.chatContent =  this.chatContent + '\n' + data.content.message;
          console.log('GOT: ', data);
        });*/
    //});
    ///////////////////////

  }

  submitMessage() {
    this.colyseus.getActiveRoom().subscribe( room => {
      room.send({type: 'CHAT_MESSAGE', content: { message: this.currentMessage }});
    });
  }

}
