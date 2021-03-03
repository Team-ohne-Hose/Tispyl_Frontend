import { Injectable } from '@angular/core';
import {ChatService} from './chat.service';
import {ColyseusNotifyable} from './game-initialisation.service';
import {GameStateService} from './game-state.service';
import {ItemMessageType, MessageType, UseItem, WsData} from '../model/WsData';
import {MapSchema} from '@colyseus/schema';
import {Player} from '../model/state/Player';

enum executeTypes { // even numbers are targeted actions, odd numbers are not targeted
  untargetedExecute = 1,
  targetedExecute = 2,
}
@Injectable({
  providedIn: 'root'
})
export class ItemService implements ColyseusNotifyable {


  private static readonly items = {
    0: {id: 0, weight: 1, name: 'Wirt',
      desc: 'Verteile 3 Rationen',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.targetedExecute},
    1: {id: 1, weight: 1, name: 'Diplomat',
      desc: 'Stelle eine Regel auf',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.untargetedExecute},
    2: {id: 2, weight: 1, name: 'Klon',
      desc: 'Ein anderer Mitspieler muss deine nächste Aufgabe auch machen',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.targetedExecute},
    3: {id: 3, weight: 1, name: 'Beste Freunde Gulasch',
      desc: 'Wähle einen Trinkbuddy',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.targetedExecute},
    4: {id: 4, weight: 1, name: 'Todfeind',
      desc: 'Löse eine Trinkbuddy Verbindung auf',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.untargetedExecute},
    5: {id: 5, weight: 1, name: 'Joker',
      desc: 'Führe ein beliebiges Feld aus',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.untargetedExecute},
    6: {id: 6, weight: 1, name: 'MOAB',
      desc: 'Alle rücken 10 Felder zurück',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.untargetedExecute},
    7: {id: 7, weight: 1, name: 'Assasin',
      desc: 'Ein Spieler muss einen Ring nach unten',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.targetedExecute},
    8: {id: 8, weight: 1, name: 'Sabotage',
      desc: 'Ein Spieler muss 5 Felder zurück',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.targetedExecute},
    9: {id: 9, weight: 1, name: 'Ah shit, here we go again',
      desc: 'Spielt danach noch eine Runde Tischspiel',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.untargetedExecute},
    10: {id: 10, weight: 1, name: 'Trittbrettfahrer',
      desc: 'Exe dein Getränk. Schaffst du es müssen alle anderen dir gleich tun.(Dein Getränk muss mindestens halb voll sein wenn du dieses Item nutzt.)',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.untargetedExecute},
    11: {id: 11, weight: 1, name: 'Losing is Fun',
      desc: 'Gehe zurück zum Start',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.untargetedExecute},
    12: {id: 12, weight: 1, name: 'Anonymer Tipp',
      desc: 'ein Spieler muss nächste Runde aussetzen',
      imgUrl: '../assets/defaultImage.jpg', executeType: executeTypes.targetedExecute},
    count: 13,
  };

  targetingItem = false;
  selectedItem = -1;
  onItemUpdate: () => void;
  gameState: GameStateService;

  constructor(private chatService: ChatService) { }

  attachColyseusStateCallbacks(gameState: GameStateService): void {
    this.gameState = gameState;
    gameState.addItemUpdateCallback((() => {
      if (this.onItemUpdate !== undefined) {
        this.onItemUpdate();
      }
    }).bind(this));
    this.onItemUpdate();
  }
  attachColyseusMessageCallbacks(gameState: GameStateService): void {
    this.gameState = gameState;
    gameState.registerMessageCallback(MessageType.ITEM_MESSAGE, {
      filterSubType: -1,
      f: (data: WsData) => {
        if (data.type === MessageType.ITEM_MESSAGE) {
          switch (data.subType) {
            case ItemMessageType.useItem:
              this.onItemUsed(data);
              break;
          }
        }
      }
    });
  }

  onItemUsed(item: UseItem) {
    let msg = `${item.playerLoginName} used ${item.itemName}: ${item.itemDescription}`;
    if (item.targetLoginName && item.targetLoginName !== '') {
      msg = msg + ' on ' + item.targetLoginName;
    }
    this.chatService.addLocalMessage(msg, 'Item Used');
  }
  getMyItemsList(): MapSchema<number> {
    const playerMe: Player = this.gameState.getMe();
    if (playerMe !== undefined) {
      return playerMe.itemList;
    }
    return undefined;
  }
  getOrderedItemList(): number[] {
    const itemListArray: number[] = [];
    const items = this.getMyItemsList();
    if (items !== undefined) {
      items.forEach((count, itemId) => {
        if (count > 0) {
          itemListArray.push(Number(itemId));
        }
      });
      itemListArray.sort((a: number, b: number) => {
        return a - b;
      });
    }
    return itemListArray;
}
  selectNextItem() {
    const itemListArray: number[] = this.getOrderedItemList();
    if (itemListArray === undefined || itemListArray.length <= 0) {
      this.selectItem(-1);
    } else if (itemListArray !== undefined) {
      let searchResult = itemListArray.find(element => element > this.selectedItem);
      if (searchResult === undefined) {
        searchResult = itemListArray.find(element => true);
      }
      this.selectItem(searchResult);
    }
  }
  selectPrevItem() {
    const itemListArray: number[] = this.getOrderedItemList();
    if (itemListArray === undefined || itemListArray.length <= 0) {
      this.selectItem(-1);
    } else if (itemListArray !== undefined) {
      for (let i = 0; i < itemListArray.length; i++) {
        if (itemListArray[i] >= this.selectedItem) {
          if (i === 0) {
            this.selectItem(itemListArray[itemListArray.length - 1]);
            return;
          } else {
            this.selectItem(itemListArray[i - 1]);
            return;
          }
        }
      }
    }
  }
  selectItem(itemId: number) {
    this.setTargeting(false);
    if (itemId < 0) {
      this.selectedItem = -1;
      return;
    }
    const items = this.getMyItemsList();
    if (items !== undefined) {
      if (items[itemId] > 0) {
        this.selectedItem = itemId;
      }
    }
  }
  getItemName(itemId: number): string {
    if (itemId < 0 || itemId >= ItemService.items.count) {
      return 'NO ITEM';
    } else {
      return ItemService.items[itemId].name;
    }
  }
  getItemDesc(itemId: number): string {
    if (itemId < 0 || itemId >= ItemService.items.count) {
      return '';
    } else {
      return ItemService.items[itemId].desc;
    }
  }
  getItemThumb(itemId: number): string {
    if (itemId < 0 || itemId >= ItemService.items.count) {
      return '../assets/defaultImage.jpg';
    } else {
      return ItemService.items[itemId].imgUrl;
    }
  }
  isItemTargetable(itemId: number): boolean {
    if (itemId >= ItemService.items.count || itemId < 0) {
      return false;
    }
    return (ItemService.items[itemId].executeType % 2) === 0;
  }
  setTargeting(en: boolean) {
    this.targetingItem = en;
  }
  isCurrentlyTargeting(): boolean {
    return this.targetingItem;
  }
  onTargetHover(targetId: number) {

  }
  onTargetSet(targetId: number) {
    this.useItem(this.selectedItem, targetId);
  }

  useItem(itemId: number, targetId?: number) {
    if (this.onItemUpdate !== undefined) {
      this.onItemUpdate();
    }

    let targetLogin = '';
    if (targetId !== undefined) {
      const targetPlayer = this.gameState.findInPlayerList((p: Player) => {
        return p.figureId === targetId;
      });
      if (targetPlayer !== undefined) {
        targetLogin = targetPlayer.loginName;
      }
    }

    this.chatService.addLocalMessage('Trying to use Item ' + itemId + ((targetLogin === '') ? '' : ' on ' + targetLogin), 'Items');
    this.gameState.sendMessage(MessageType.ITEM_MESSAGE, {
      type: MessageType.ITEM_MESSAGE,
      subType: ItemMessageType.useItem,
      playerLoginName: this.gameState.getMyLoginName(),
      targetLoginName: targetLogin,
      itemId: itemId,
      param: '',
      itemName: ItemService.items[itemId].name,
      itemDescription: ItemService.items[itemId].desc
    });
    this.selectNextItem();
  }
}
