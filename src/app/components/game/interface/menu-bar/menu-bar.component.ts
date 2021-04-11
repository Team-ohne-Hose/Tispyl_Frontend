import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import {
  animate,
  animateChild,
  animation,
  AnimationEvent,
  group,
  query,
  sequence,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Player } from '../../../../model/state/Player';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css'],
  animations: []
})
export class MenuBarComponent {

  @Input() playerList: Player[];
  @Input() ruleList = [];

  @ViewChild('registerFooter') registerFooter: ElementRef;
  @ViewChild('tabEdge') tabEdge: ElementRef;

  tabIndex = 0;

  constructor() {
  }

  toggleTab(targetTabIndex: number): void {
    if (this.tabIndex === targetTabIndex) {
      this.unselectTab(targetTabIndex);
    } else {
      this.selectTab(targetTabIndex);
    }
  }

  private selectTab(targetTabIndex: number): void {
    this.tabIndex = targetTabIndex;
  }

  private unselectTab(targetTabIndex: number): void {
    if (this.tabIndex === targetTabIndex) {
      this.tabIndex = 0;
    }
  }
}
