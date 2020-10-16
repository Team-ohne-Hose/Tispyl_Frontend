import { Injectable } from '@angular/core';
import {ChatService} from './chat.service';
import {ColyseusNotifyable} from './game-initialisation.service';
import {GameStateService} from './game-state.service';
import {ItemMessageType, MessageType, UseItem, WsData} from '../model/WsData';

@Injectable({
  providedIn: 'root'
})
export class ItemService implements ColyseusNotifyable {

  constructor(private chatService: ChatService) { }

  attachColyseusStateCallbacks(gameState: GameStateService): void {}
  attachColyseusMessageCallbacks(gameState: GameStateService): void {
    gameState.registerMessageCallback(MessageType.ITEM_MESSAGE, {
      filterSubType: -1,
      f: (data: WsData) => {
        if (data.type === MessageType.ITEM_MESSAGE) {
          switch (data.subType) {
            case ItemMessageType.useItem:
              this.onItemUse(data);
              break;
          }
        }
      }
    });
  }

  onItemUse(item: UseItem) {
    let msg = `${item.playerLoginName} used ${item.itemName}: ${item.itemDescription}`;
    if (item.targetLoginName && item.targetLoginName !== '') {
      msg = msg + ' on ' + item.targetLoginName;
    }
    this.chatService.addLocalMessage(msg, 'Item Used');
  }
}
