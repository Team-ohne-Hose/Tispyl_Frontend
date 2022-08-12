import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameSettingsService {
  // Volume
  @Output() volume = new EventEmitter<number>();
  @Output() isMuted = new EventEmitter<boolean>();

  // Display
  @Output() isPersistent = new EventEmitter<boolean>();
}
