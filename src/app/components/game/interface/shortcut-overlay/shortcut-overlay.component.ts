import { Component, OnInit } from '@angular/core';

export enum ShortcutType {
  key = 0,
  lmb,
  rmb,
  mousewheel,
}
interface Shortcut {
  type: ShortcutType;
  name: string;
  description: string;
}

@Component({
  selector: 'app-shortcut-overlay',
  templateUrl: './shortcut-overlay.component.html',
  styleUrls: ['./shortcut-overlay.component.css'],
})
export class ShortcutOverlayComponent implements OnInit {
  ShortcutType = ShortcutType;
  shortcuts: Shortcut[] = [
    {
      type: ShortcutType.key,
      name: 'tab',
      description: 'show names of players',
    },
    {
      type: ShortcutType.lmb,
      name: 'click',
      description: 'pick up/drop off a figure',
    },
    {
      type: ShortcutType.rmb,
      name: 'hold',
      description: 'move and rotate view',
    },
    {
      type: ShortcutType.mousewheel,
      name: '',
      description: 'get closer to the board',
    },
  ];

  ngOnInit(): void {
    return;
  }
}
