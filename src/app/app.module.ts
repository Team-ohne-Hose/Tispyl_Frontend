import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameDisplayComponent } from './game-display/game-display.component';
import { LoginComponent } from './login/login.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { RegisterComponent } from './register/register.component';
import { RulesComponent } from './rules/rules.component';

@NgModule({
  declarations: [
    AppComponent,
    GameDisplayComponent,
    LoginComponent,
    PlayerListComponent,
    RegisterComponent,
    RulesComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
