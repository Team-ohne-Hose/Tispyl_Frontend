import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameDisplayComponent } from './components/lobby/game-display/game-display.component';
import { LoginComponent } from './components/lobby/login/login.component';
import { RulesComponent } from './components/lobby/rules/rules.component';
import { GifViewerComponent } from './components/lobby/gif-viewer/gif-viewer.component';
import { LanguageSelectorComponent } from './components/lobby/language-selector/language-selector.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { RegisterPopupComponent } from './components/lobby/dialogs/register-popup/register-popup.component';
import { MatSelectModule } from '@angular/material/select';
import { ProfileDisplayComponent } from './components/lobby/profile-display/profile-display.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ViewportComponent } from './components/game/viewport/viewport.component';
import { OpenGamePopupComponent } from './components/lobby/dialogs/open-game-popup/open-game-popup.component';
import { JoinGameComponent } from './components/lobby/dialogs/join-game/join-game.component';
import { InterfaceComponent } from './components/game/interface/interface.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StateDisplayComponent } from './components/game/interface/state-display/state-display.component';
import { ConnectedPlayersComponent } from './components/game/interface/connected-players/connected-players.component';
import { PregameBannerComponent } from './components/game/interface/pregame-banner/pregame-banner.component';
import { DebugdummyComponent } from './components/debugdummy/debugdummy.component';
import { IngameRuleBookComponent } from './components/game/interface/menu-bar/ingame-rule-book/ingame-rule-book.component';
import { NextTurnButtonComponent } from './components/game/interface/next-turn-button/next-turn-button.component';
import { TurnOverlayComponent } from './components/game/interface/turn-overlay/turn-overlay.component';
import { TileOverlayComponent } from './components/game/interface/tile-overlay/tile-overlay.component';
import { LoadingScreenComponent } from './components/game/loading-screen/loading-screen.component';
import { VoteSystemComponent } from './components/game/interface/menu-bar/vote-system/vote-system.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ShowAttribComponent } from './components/game/show-attrib/show-attrib.component';
import { MenuBarComponent } from './components/game/interface/menu-bar/menu-bar.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { HomeRegisterComponent } from './components/game/interface/menu-bar/home-register/home-register.component';
import { TrinkBuddyDisplayComponent } from './components/game/interface/menu-bar/home-register/trink-buddy-display/trink-buddy-display.component';
import { ItemsInterfaceComponent } from './components/game/interface/state-display/items-interface/items-interface.component';
import { HistoricResultsDisplayComponent } from './components/game/interface/menu-bar/vote-system/historic-results-display/historic-results-display.component';
import { VoteCreatorComponent } from './components/game/interface/menu-bar/vote-system/vote-creator/vote-creator.component';
import { PlayerIconComponent } from './components/framework/player-icon/player-icon.component';
import { AuthInterceptor } from './modules/AuthInterceptor';

const appRoutes: Routes = [
  {path: 'lobby', component: LobbyComponent},
  {path: 'debug', component: DebugdummyComponent},
  {path: 'game', component: GameComponent},
  {path: '', redirectTo: '/lobby', pathMatch: 'full'},
  {path: '**', component: PageNotFoundComponent}
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
    ShowAttribComponent,
    MenuBarComponent,
    HomeRegisterComponent,
    TrinkBuddyDisplayComponent,
    ItemsInterfaceComponent,
    HistoricResultsDisplayComponent,
    VoteCreatorComponent,
    PlayerIconComponent
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
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
