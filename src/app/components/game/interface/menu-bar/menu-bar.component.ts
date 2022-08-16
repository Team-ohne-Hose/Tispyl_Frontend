import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { faClipboard, faGears, faHome, faPersonBooth } from '@fortawesome/free-solid-svg-icons';
import { Player } from '../../../../model/state/Player';

export enum TabIndex {
  'Home' = 1,
  'Rules' = 2,
  'Vote' = 3,
  'Settings' = 4,
}

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css'],
})
export class MenuBarComponent {
  @Input() playerList: Player[];
  @Input() ruleList = [];

  @ViewChild('registerFooter') registerFooter: ElementRef;
  @ViewChild('tabEdge') tabEdge: ElementRef;

  public tabIndex: TabIndex = 0;

  //Font Awesome Icons
  public faGears = faGears;
  public faPersonBooth = faPersonBooth;
  public faClipboard = faClipboard;
  public faHome = faHome;

  toggleTab(targetTabIndex: TabIndex): void {
    if (this.tabIndex === targetTabIndex) {
      this.unselectTab(targetTabIndex);
    } else {
      this.selectTab(targetTabIndex);
    }
  }

  private selectTab(targetTabIndex: TabIndex): void {
    this.tabIndex = targetTabIndex;
  }

  private unselectTab(targetTabIndex: TabIndex): void {
    if (this.tabIndex === targetTabIndex) {
      this.tabIndex = 0;
    }
  }
}
