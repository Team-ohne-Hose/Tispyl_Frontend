import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RoomAvailable } from 'colyseus.js';
import { RoomMetaInfo } from '../../../model/RoomMetaInfo';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-display',
  templateUrl: './game-display.component.html',
  styleUrls: ['./game-display.component.css'],
})
export class GameDisplayComponent {
  @Input() game: RoomAvailable<RoomMetaInfo>;
  @Input() isDummy: boolean;
  @Input() isActive: boolean;
  @Input() languageObjects: any;

  @Output() leave = new EventEmitter<void>();
  @Output() join = new EventEmitter<RoomAvailable<RoomMetaInfo>>();
  @Output() enter = new EventEmitter<void>();

  constructor(public router: Router) {}

  emitLeave(): void {
    this.leave.emit();
  }

  emitEnter(): void {
    this.enter.emit();
    this.router.navigateByUrl('/game');
  }

  emitJoin(): void {
    this.join.emit(this.game);
  }
}
