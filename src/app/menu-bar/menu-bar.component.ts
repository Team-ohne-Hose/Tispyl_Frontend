import {Component, ElementRef, Input, ViewChild} from '@angular/core';
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

  @ViewChild('registerFooter') registerFooter: ElementRef;
  @ViewChild('tabEdge') tabEdge: ElementRef;

  tabIndex = undefined;

  constructor() { }

  toggleTab(event): void {
    console.log(event.target.classList);
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
