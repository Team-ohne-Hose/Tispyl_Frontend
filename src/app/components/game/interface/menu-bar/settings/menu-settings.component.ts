import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameSettingsService, StorageKey } from 'src/app/services/game-settings.service';

@Component({
  selector: 'app-menu-bar-settings',
  templateUrl: './menu-settings.component.html',
  styleUrls: ['./menu-settings.component.css'],
})
export class MenuSettingsComponent implements OnInit, OnDestroy {
  public persistentNamePlates = this.gss.getValueFromLocalStroage(StorageKey.PersistNamePlates);

  // subscriptions
  private persistentNamePlates$$: Subscription;

  constructor(public gss: GameSettingsService) {}

  ngOnInit(): void {
    this.persistentNamePlates$$ = this.gss.persistentNamePlates.subscribe((persistentNamePlates) => {
      this.persistentNamePlates = persistentNamePlates;
    });
  }

  ngOnDestroy(): void {
    this.persistentNamePlates$$.unsubscribe();
  }

  handleChange(event: Event) {
    if (event && event.target && event.target instanceof HTMLInputElement) {
      this.gss.persistentNamePlates.next(event.target.checked);
    }
  }
}
