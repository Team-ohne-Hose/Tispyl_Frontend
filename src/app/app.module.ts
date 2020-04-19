import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameDisplayComponent } from './lobby/game-display/game-display.component';
import { LoginComponent } from './lobby/login/login.component';
import { RulesComponent } from './lobby/rules/rules.component';
import { GifViewerComponent } from './lobby/gif-viewer/gif-viewer.component';
import { LanguageSelectorComponent } from './lobby/language-selector/language-selector.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { RegisterPopupComponent } from './lobby/dialogs/register-popup/register-popup.component';
import {MatSelectModule} from '@angular/material/select';
import { ProfileDisplayComponent } from './lobby/profile-display/profile-display.component';
import { LobbyComponent } from './lobby/lobby.component';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ViewportComponent } from './game/viewport/viewport.component';
import { OpenGamePopupComponent } from './lobby/dialogs/open-game-popup/open-game-popup.component';
import { JoinGameComponent } from './lobby/dialogs/join-game/join-game.component';
import { InterfaceComponent } from './interface/interface.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ChatWindowComponent } from './interface/chat-window/chat-window.component';
import { StateDisplayComponent } from './interface/state-display/state-display.component';
import { ConnectedPlayersComponent } from './interface/connected-players/connected-players.component';

const appRoutes: Routes = [
  { path: 'lobby', component: LobbyComponent},
  { path: 'game', component: GameComponent},
  { path: '', redirectTo: '/lobby', pathMatch: 'full'},
  { path: '**', component: PageNotFoundComponent }
  ];

@NgModule({
  declarations: [
    AppComponent,
    GameDisplayComponent,
    LoginComponent,
    RulesComponent,
    GifViewerComponent,
    LanguageSelectorComponent,
    RegisterPopupComponent,
    ProfileDisplayComponent,
    LobbyComponent,
    GameComponent,
    PageNotFoundComponent,
    ViewportComponent,
    OpenGamePopupComponent,
    JoinGameComponent,
    InterfaceComponent,
    ChatWindowComponent,
    StateDisplayComponent,
    ConnectedPlayersComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes // ,{ enableTracing: true } // <-- debugging purposes only
    ),
    DragDropModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
