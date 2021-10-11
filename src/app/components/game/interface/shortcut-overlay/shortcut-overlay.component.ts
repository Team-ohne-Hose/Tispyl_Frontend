import { Component, OnInit } from '@angular/core';

export enum ShortcutType {
  key_tab = 0,
  lmb,
  rmb,
  mousewheel,
}
interface Shortcut {
  type: ShortcutType;
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
      type: ShortcutType.key_tab,
      description: 'Spielernamen anzeigen',
    },
    {
      type: ShortcutType.lmb,
      description: 'Spielfigur aufnehmen/ablegen',
    },
    {
      type: ShortcutType.rmb,
      description: 'Kamera bewegen',
    },
    {
      type: ShortcutType.mousewheel,
      description: 'Zoomen',
    },
  ];

  visible = true;

  toggleVisibility(): void {
    this.visible = !this.visible;
  }

  ngOnInit(): void {
    return;
  }
}
