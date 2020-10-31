import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
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
import {Player} from '../model/state/Player';
import {VoteSystemState} from '../game/interface/vote-system/VoteSystemState';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css'],
  animations: []
})
export class MenuBarComponent {

  selectionClass = 'selected';
  registerTabClass = 'register-tab';


  @Input() playerList: Player[];
  @Input() ruleList = [];
  @Output() executeNewChatCommand = new EventEmitter<string[]>();

  @ViewChild('registerFooter') registerFooter: ElementRef;
  @ViewChild('tabEdge') tabEdge: ElementRef;

  tabIndex = 2;

  constructor() { }

  toggleTab(event): void {
    if (event.target.parentElement.classList.contains(this.selectionClass)) {
      this.unselectTab(event);
    } else {
      this.selectTab(event);
    }
  }

  private selectTab(event): void {
    const tabs = document.getElementsByClassName(this.registerTabClass);
    const elements = document.getElementsByClassName(this.registerTabClass);
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove(this.selectionClass);
    }

    this.registerFooter.nativeElement.classList.add(this.selectionClass);
    this.tabEdge.nativeElement.classList.add(this.selectionClass);
    event.target.parentElement.classList.add(this.selectionClass);

    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].classList.contains(this.selectionClass)) {
        this.tabIndex = i;
      }
    }
  }

  private unselectTab(event): void {
    event.target.parentElement.classList.remove(this.selectionClass);
    this.tabIndex = undefined;
    this.registerFooter.nativeElement.classList.remove(this.selectionClass);
    this.tabEdge.nativeElement.classList.remove(this.selectionClass);
  }
}
