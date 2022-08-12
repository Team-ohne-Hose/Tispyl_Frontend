import { Component } from '@angular/core';

@Component({
  selector: 'app-menu-bar-settings',
  templateUrl: './menu-settings.component.html',
  styleUrls: ['../menu-bar.component.css'],
})
export class MenuSettingsComponent {
  // TODO: Toggle persistant display Usernames

  private showPlayerNames = false;

  constructor() {
    console.log('Settings Component');
  }

  public toggleDisplayPlayerNames() {
    this.showPlayerNames = !this.showPlayerNames;
  }
}
