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
import { InterfaceComponent } from './game/interface/interface.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ChatWindowComponent } from './game/interface/chat-window/chat-window.component';
import { StateDisplayComponent } from './game/interface/state-display/state-display.component';
import { ConnectedPlayersComponent } from './game/interface/connected-players/connected-players.component';
import { PregameBannerComponent } from './game/interface/pregame-banner/pregame-banner.component';
import { DebugdummyComponent } from './debugdummy/debugdummy.component';
import { IngameRuleBookComponent } from './game/interface/ingame-rule-book/ingame-rule-book.component';
import { NextTurnButtonComponent } from './game/interface/next-turn-button/next-turn-button.component';
import { TurnOverlayComponent } from './game/interface/turn-overlay/turn-overlay.component';
import { TileOverlayComponent } from './game/interface/tile-overlay/tile-overlay.component';
import { LoadingScreenComponent } from './game/loading-screen/loading-screen.component';
import { VoteSystemComponent } from './game/interface/vote-system/vote-system.component';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatStepperModule} from '@angular/material/stepper';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { VoteCreationComponent } from './customUI/vote-creation/vote-creation.component';
import {CdkStepperModule} from '@angular/cdk/stepper';
import { ShowAttribComponent } from './game/show-attrib/show-attrib.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { HomeRegisterComponent } from './home-register/home-register.component';
import { TrinkBuddyDisplayComponent } from './trink-buddy-display/trink-buddy-display.component';
import { ItemsInterfaceComponent } from './game/interface/items-interface/items-interface.component';

const appRoutes: Routes = [
  { path: 'lobby', component: LobbyComponent},
  { path: 'debug', component: DebugdummyComponent},
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
    ConnectedPlayersComponent,
    PregameBannerComponent,
    DebugdummyComponent,
    IngameRuleBookComponent,
    NextTurnButtonComponent,
    TurnOverlayComponent,
    TileOverlayComponent,
    LoadingScreenComponent,
    VoteSystemComponent,
    VoteCreationComponent,
    ShowAttribComponent,
    MenuBarComponent,
    HomeRegisterComponent,
    TrinkBuddyDisplayComponent,
    ItemsInterfaceComponent
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
    MatExpansionModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatSlideToggleModule,
    CdkStepperModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
