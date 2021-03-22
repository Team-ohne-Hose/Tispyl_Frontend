import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../../../../services/item.service';

@Component({
  selector: 'app-items-interface',
  templateUrl: './items-interface.component.html',
  styleUrls: ['./items-interface.component.css']
})
export class ItemsInterfaceComponent implements OnInit {

  itemThumbnail = '../assets/defaultImage.jpg';
  itemName = 'NO ITEM';
  itemDescription = '';
  scrollable = true;

  constructor(public items: ItemService) {
  }

  ngOnInit(): void {
    this.items.onItemUpdate = this.onItemUpdate.bind(this);
  }

  updateItemData() {
    if (this.items.selectedItem < 0) {
      if (!(this.items.getOrderedItemList().length > 0)) {
        this.itemName = 'NO ITEM SELECTED';
        this.itemDescription = '';
        this.itemThumbnail = '../assets/defaultImage.jpg';
        return;
      } else {
        // there are items selectable, so select one automatically.
        this.items.selectNextItem();
      }
    }
    this.itemName = this.items.getItemName(this.items.selectedItem);
    this.itemDescription = this.items.getItemDesc(this.items.selectedItem);
    this.itemThumbnail = this.items.getItemThumb(this.items.selectedItem);
  }

  prevItem($event: Event) {
    this.items.setTargeting(false);
    this.items.selectPrevItem();
    this.updateItemData();
  }

  nextItem($event: Event) {
    this.items.setTargeting(false);
    this.items.selectNextItem();
    this.updateItemData();
  }

  activateItem($event: Event) {
    if (this.items.isCurrentlyTargeting()) {
      this.items.setTargeting(false);
    } else {
      if (this.items.isItemTargetable(this.items.selectedItem)) {
        this.items.setTargeting(true);
      } else {
        this.items.useItem(this.items.selectedItem);
      }
    }
  }

  onItemUpdate() {
    this.updateItemData();
  }
}
