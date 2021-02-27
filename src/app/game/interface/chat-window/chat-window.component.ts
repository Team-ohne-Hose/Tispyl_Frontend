import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {MessageType, WsData} from '../../../model/WsData';
import {GameStateService} from '../../../services/game-state.service';
import {ColyseusNotifyable} from '../../../services/game-initialisation.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements ColyseusNotifyable {

  constructor(private gameState: GameStateService) { }

  messageHistory: string[] = [];
  historyIndex = 0;

  currentMessage = '';
  chatContent = '';

  @Output() chatCommand = new EventEmitter<string[]>();
  @ViewChild('chat') chatRef: ElementRef;

  attachColyseusStateCallbacks(gameState: GameStateService): void {}
  attachColyseusMessageCallbacks(gameState: GameStateService): void {
    gameState.registerMessageCallback(MessageType.CHAT_MESSAGE, {
      filterSubType: -1,
      f: (data: WsData) => {
        if (data.type === MessageType.CHAT_MESSAGE) {
          this.postChatMessage(data.message);
        }
      }
    });

    gameState.registerMessageCallback(MessageType.JOIN_MESSAGE, {
      filterSubType: -1,
      f: (data: WsData) => {
        if (data.type === MessageType.JOIN_MESSAGE) {
          this.postChatMessage(data.message);
        }
      }
    });

    gameState.registerMessageCallback(MessageType.LEFT_MESSAGE, {
      filterSubType: -1,
      f: (data: WsData) => {
        if (data.type === MessageType.LEFT_MESSAGE) {
          this.postChatMessage(data.message);
        }
      }
    });
  }

  submitMessage() {
    if (this.currentMessage.length > 0) {
      this.messageHistory.unshift(this.currentMessage);
      this.historyIndex = 0;

      if (this.currentMessage[0] === '/') {
        this.executeChatCommand();
      } else {
        this.gameState.sendMessage(MessageType.CHAT_MESSAGE, {type: MessageType.CHAT_MESSAGE, message: this.currentMessage });
        this.currentMessage = '';
      }
    }
  }

  enter(keyEvent) {
    if (keyEvent.key === 'Enter') {
      this.submitMessage();

    } else if (keyEvent.key === 'ArrowUp') {

      if (this.historyIndex <= this.messageHistory.length - 1) {
        this.currentMessage = this.messageHistory[this.historyIndex] || '';
        this.historyIndex = this.historyIndex + 1;
      } else {
        this.historyIndex = 0;
      }

    }
  }

  postChatMessage( msg: string ) {
    this.chatRef.nativeElement.value += msg.trim() + '\n';
    this.chatRef.nativeElement.scrollTop = this.chatRef.nativeElement.scrollHeight;
  }

  executeChatCommand() {
    const commandString: string = this.currentMessage;
    const args = commandString.split(' ');
    this.currentMessage = '';
    this.chatCommand.emit(args);
  }

}
