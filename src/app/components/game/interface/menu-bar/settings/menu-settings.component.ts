import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameSettingsService, StorageKey } from 'src/app/services/game-settings.service';
import { faGears } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-menu-bar-settings',
  templateUrl: './menu-settings.component.html',
  styleUrls: ['../menu-bar.component.css', '../user-info.css'],
})
export class MenuSettingsComponent implements OnInit, OnDestroy {
  public persistentNamePlates = this.gss.getValueFromLocalStroage(StorageKey.PersistNamePlates);
  private subscription: Subscription;

  constructor(public gss: GameSettingsService) {}

  ngOnInit(): void {
    this.subscription = this.gss.persistentNamePlates.subscribe((persistentNamePlates) => {
      this.persistentNamePlates = persistentNamePlates;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleChange(event: { target: HTMLInputElement }) {
    this.gss.persistentNamePlates.next(event.target.checked);
  }
}
