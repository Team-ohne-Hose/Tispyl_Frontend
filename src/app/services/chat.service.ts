import { Injectable, OnDestroy } from '@angular/core';
import { MessageType, WsData } from '../model/WsData';
import { GameStateService } from './game-state.service';
import { ChatMessage } from '../components/game/interface/menu-bar/home-register/helpers/ChatMessage';
import { ColyseusClientService } from './colyseus-client.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  printMessageCallback: () => void;
  private chatMessages: ChatMessage[] = [];
  private callbackIds: number[] = [];

  // subscriptions
  private activeRoom$$: Subscription;

  constructor(private gameState: GameStateService, private colyseus: ColyseusClientService) {
    this.activeRoom$$ = this.colyseus.activeRoom$.subscribe((r) => {
      if (r === undefined) {
        console.info('Resetting chat messages');
        this.chatMessages = [];
      }
    });

    this.callbackIds.push(
      this.gameState.registerMessageCallback(MessageType.CHAT_MESSAGE, {
        filterSubType: -1,
        f: (data: WsData) => {
          if (data.type === MessageType.CHAT_MESSAGE) {
            this.gameState.getDisplayNameOnce$(data.authorLoginName).subscribe((displayName: string) => {
              this.onChatMessageReceived(data.message, displayName || data.authorLoginName);
            });
          }
        },
      })
    );

    this.callbackIds.push(
      this.gameState.registerMessageCallback(MessageType.JOIN_MESSAGE, {
        filterSubType: -1,
        f: (data: WsData) => {
          if (data.type === MessageType.JOIN_MESSAGE) {
            this.onChatMessageReceived(data.message, 'SERVER');
          }
        },
      })
    );

    this.callbackIds.push(
      this.gameState.registerMessageCallback(MessageType.LEFT_MESSAGE, {
        filterSubType: -1,
        f: (data: WsData) => {
          if (data.type === MessageType.LEFT_MESSAGE) {
            this.onChatMessageReceived(data.message, 'SERVER');
          }
        },
      })
    );

    this.callbackIds.push(
      this.gameState.registerMessageCallback(MessageType.SERVER_MESSAGE, {
        filterSubType: -1,
        f: (data: WsData) => {
          if (data.type === MessageType.SERVER_MESSAGE) {
            this.onChatMessageReceived(data.message, data.origin);
          }
        },
      })
    );
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  sendMessage(currentMessage: string): void {
    if (this.gameState !== undefined) {
      this.gameState.sendMessage(MessageType.CHAT_MESSAGE, { type: MessageType.CHAT_MESSAGE, message: currentMessage });
    }
  }

  addLocalMessage(msg: string, sender: string): void {
    this.chatMessages.push(new ChatMessage(msg, sender));
    if (this.printMessageCallback) {
      this.printMessageCallback();
    }
  }

  getChatMessages(): ChatMessage[] {
    return this.chatMessages;
  }

  setMessageCallback(cb: () => void): void {
    this.printMessageCallback = cb;
  }

  onChatMessageReceived(msg: string, sender: string): void {
    this.chatMessages.push(new ChatMessage(msg, sender));
    console.log('New chat message: "' + msg + '" current message count: ', this.chatMessages.length);
    if (this.printMessageCallback) {
      this.printMessageCallback();
    }
  }

  ngOnDestroy(): void {
    this.callbackIds.forEach((id) => {
      this.gameState.clearMessageCallback(id);
    });
    this.activeRoom$$.unsubscribe();
  }
}
