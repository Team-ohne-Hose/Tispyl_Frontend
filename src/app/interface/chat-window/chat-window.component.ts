import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
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

  @Output() chatCommand = new EventEmitter<string[]>();

  @ViewChild('chat') chatRef: ElementRef;

  ngOnInit(): void {
    this.colyseus.setChatCallback(data => {
      console.log('chatt-callback');
      this.chatContent =  this.chatContent + '\n' + data.content.message;
      this.chatRef.nativeElement.scrollTop = this.chatRef.nativeElement.scrollHeight;
    });
  }

  submitMessage() {
    this.colyseus.getActiveRoom().subscribe( room => {
      if (this.currentMessage.length > 0) {
        if (this.currentMessage[0] === '/') {
          this.executeChatCommand();
        } else {
          room.send({type: 'CHAT_MESSAGE', content: { message: this.currentMessage }});
          this.currentMessage = '';
        }
      }
    });
  }

  enter(keyEvent) {
    if (keyEvent.key === 'Enter') {
      this.submitMessage();
    }
  }

  executeChatCommand() {
    const commandString: string = this.currentMessage;
    const args = commandString.split(' ');
    this.currentMessage = '';
    this.chatCommand.emit(args);
  }

}
