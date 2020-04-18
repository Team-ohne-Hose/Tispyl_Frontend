import {Message} from '@angular/compiler/src/i18n/i18n_ast';

export type WsData = ChatMessage;

enum MessageType {
  CHAT_MESSAGE,
  GAME_MESSAGE,
  OTHER
}

export interface ChatMessage {
  type: MessageType.CHAT_MESSAGE;
  message: string;
}




