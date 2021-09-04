import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ItemService } from '../../../../services/items-service/item.service';
import { Observable, Subscription } from 'rxjs';
import { executeTypes, Item, itemTable } from '../../../../services/items-service/itemLUT';
import { CommandService } from '../../../../services/command.service';
import { GameStateService } from '../../../../services/game-state.service';

@Component({
  selector: 'app-items-interface',
  templateUrl: './items-interface.component.html',
  styleUrls: ['./items-interface.component.css'],
})
export class ItemsInterfaceComponent implements OnDestroy {
  /** Constants */
  readonly MAX_ITEM_COUNT = 5;
  readonly itemTable = itemTable;

  /** Visibility state */
  isHost$: Observable<boolean>;
  isInfoHidden = true;
  isHostHidden = true;
  slotHidden: boolean[];
  @ViewChild('info') infoRef: ElementRef<HTMLDivElement>;
  @ViewChild('host') hostRef: ElementRef<HTMLDivElement>;

  /** Input tag values */
  giveItem_name: string;
  giveItem_itemId: number;
  random_max: number;

  /** Content values */
  itemList$$: Subscription;
  itemList: Item[] = [];

  constructor(
    private itemService: ItemService,
    private commandService: CommandService,
    public gameState: GameStateService
  ) {
    this.slotHidden = new Array<boolean>(this.MAX_ITEM_COUNT).fill(true, 0, this.MAX_ITEM_COUNT);
    this.itemList$$ = this.itemService.myItems$.subscribe((list: Item[]) => {
      this.itemList = list;
    });
    this.isHost$ = this.gameState.amIHost();
  }

  ngOnDestroy(): void {
    this.itemList$$.unsubscribe();
  }

  activateItem(slotIdx: number): void {
    const activatedItem: Item = this.itemList[slotIdx];
    if (activatedItem.executeType === executeTypes.TARGETED) {
      this.itemService.useItemTargeted(activatedItem);
    } else {
      this.itemService.useItem(activatedItem);
    }
  }

  /** Popover close event handler */
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    /** Quick way out if nothing is visible */
    if (this.isInfoHidden && this.isHostHidden) {
      return;
    }
    /** Close info box on any clicks outside */
    if (this.infoRef !== undefined) {
      if (!this.infoRef.nativeElement.contains(event.target as HTMLElement)) {
        this.isInfoHidden = true;
      }
    }
    /** Close host box on any clicks outside */
    if (this.hostRef !== undefined) {
      if (!this.hostRef.nativeElement.contains(event.target as HTMLElement)) {
        this.isHostHidden = true;
      }
    }
  }

  /** Command bindings, these should be replaced by a proper commandService API */
  perspectiveChange(): void {
    this.commandService.executeChatCommand('/perspectiveChange');
  }

  coinFlip(): void {
    this.commandService.executeChatCommand('/coinflip');
  }

  giveItem(): void {
    if (this.giveItem_name !== undefined && this.giveItem_itemId !== undefined) {
      this.commandService.executeChatCommand(`/giveItem ${this.giveItem_name} ${this.giveItem_itemId}`);
      this.giveItem_name = undefined;
      this.giveItem_itemId = undefined;
    } else {
      alert(
        'Die Aktion konnte nicht ausgeführt werden da entweder der Spieler name oder die ItemID nicht definiert waren.'
      );
    }
  }

  random(): void {
    if (this.random_max !== undefined) {
      this.commandService.executeChatCommand(`/random ${this.random_max}`);
      this.random_max = undefined;
    } else {
      alert('Die Aktion konnte nicht ausgeführt werden da die maximal zahl nicht definiert war.');
    }
  }

  startGame(): void {
    this.commandService.executeChatCommand('/start');
  }

  nextAction(): void {
    this.commandService.executeChatCommand('/nextAction');
  }

  nextTurn(): void {
    this.commandService.executeChatCommand('/next');
  }
}