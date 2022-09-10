import { Injectable, OnDestroy } from '@angular/core';
import { ChatService } from '../chat.service';
import { GameStateService } from '../game-state.service';
import { ItemMessageType, MessageType, UseItem, WsData } from '../../model/WsData';
import { Player } from '../../model/state/Player';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Item, itemTable } from './itemLUT';

export enum itemTargetErrorType {
  UNKNOWN,
  USER_ABORT,
}

export interface ItemTargetError {
  type: itemTargetErrorType;
  event: Event;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ItemService implements OnDestroy {
  private latestTarget: Player;
  target$: Subject<Player> = undefined;
  myItems$: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>([]);

  // subscriptions
  private me$$: Subscription;

  constructor(private chatService: ChatService, private gameState: GameStateService) {
    this.me$$ = this.gameState.getMe$().subscribe((player: Player) => {
      const itemListArray: Item[] = [];
      player.itemList.forEach((count, itemId) => {
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            itemListArray.push(itemTable.list[Number(itemId)]);
          }
        }
      });
      this.myItems$.next(itemListArray);
    });
    gameState.registerMessageCallback(MessageType.ITEM_MESSAGE, {
      filterSubType: -1,
      f: (data: WsData) => {
        if (data.type === MessageType.ITEM_MESSAGE) {
          switch (data.subType) {
            case ItemMessageType.useItem:
              this.onItemUsedByTeammate(data);
              break;
          }
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.me$$.unsubscribe();
  }

  /** Starts the targeting process resulting in an observable that is completed if the player aborts
   * the operation or successfully selects a Player. */
  targetPlayer(): Subject<Player> {
    if (this.target$ && !this.target$.closed) {
      this.target$.complete();
    }
    this.target$ = new Subject<Player>();
    return this.target$;
  }

  abortTargeting(reason: ItemTargetError): void {
    if (this.target$ !== undefined) {
      this.target$.error(reason);
      this.target$.complete();
      this.target$ = undefined;
    } else {
      console.warn('onTargetFinished(p: Player) called while this.target$ = ' + this.target$);
    }
  }

  onTargetHover(p: Player): void {
    if (this.target$ !== undefined) {
      this.target$.next(p);
    } else {
      console.warn('onTargetHover(p: Player) called while this.target$ = ' + this.target$);
    }
  }

  onTargetFinish(p: Player): void {
    if (this.target$ !== undefined) {
      this.target$.next(p);
      this.target$.complete();
      this.target$ = undefined;
    } else {
      console.warn('onTargetFinished(p: Player) called while this.target$ = ' + this.target$);
    }
  }

  isTargeting(): boolean {
    return this.target$ !== undefined;
  }

  useItemTargeted(item: Item): void {
    this.targetPlayer().subscribe(
      (p: Player) => {
        this.latestTarget = p;
      },
      (error: ItemTargetError) => {
        switch (error.type) {
          case itemTargetErrorType.USER_ABORT:
            console.debug('User aborted targeting process.');
            break;
          default:
            console.error('Failed to properly handle targeting error in ', this, 'Error: ', error);
            break;
        }
      },
      () => {
        this.useItem(item, this.latestTarget);
        this.latestTarget = undefined;
      }
    );
  }

  useItem(item: Item, target?: Player): void {
    let targetLogin = '';
    if (target !== undefined) {
      targetLogin = target.loginName;
    }

    this.gameState.sendMessage(MessageType.ITEM_MESSAGE, {
      type: MessageType.ITEM_MESSAGE,
      subType: ItemMessageType.useItem,
      playerLoginName: this.gameState.getMyLoginName(),
      targetLoginName: targetLogin,
      itemId: item.id,
      param: '',
      itemName: item.name,
      itemDescription: item.description,
    });

    this.onItemUsedByMe(item, targetLogin);
  }

  private onItemUsedByTeammate(item: UseItem): void {
    let msg = `${item.playerLoginName} used ${item.itemName}: ${item.itemDescription}`;
    if (item.targetLoginName && item.targetLoginName !== '') {
      msg = msg + ' on ' + item.targetLoginName;
    }
    this.chatService.addLocalMessage(msg, 'Item Used');
  }

  private onItemUsedByMe(item: Item, targetLogin: string): void {
    this.chatService.addLocalMessage('Trying to use Item ' + item.id + (targetLogin === '' ? '' : ' on ' + targetLogin), 'Items');
  }
}
