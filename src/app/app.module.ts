/* eslint-disable max-len */
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { GameDisplayComponent } from './components/home/game-display/game-display.component';
import { LoginComponent } from './components/home/login/login.component';
import { RulesComponent } from './components/home/rules/rules.component';
import { GifViewerComponent } from './components/home/gif-viewer/gif-viewer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { RegisterPopupComponent } from './components/home/dialogs/register-popup/register-popup.component';
import { MatSelectModule } from '@angular/material/select';
import { ProfileDisplayComponent } from './components/home/profile-display/profile-display.component';
import { LobbyComponent } from './components/home/lobby/lobby.component';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ViewportComponent } from './components/game/viewport/viewport.component';
import { OpenGamePopupComponent } from './components/home/dialogs/open-game-popup/open-game-popup.component';
import { JoinGameComponent } from './components/home/dialogs/join-game/join-game.component';
import { InterfaceComponent } from './components/game/interface/interface.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StateDisplayComponent } from './components/game/interface/state-display/state-display.component';
import { ConnectedPlayersComponent } from './components/game/interface/connected-players/connected-players.component';
import { PregameBannerComponent } from './components/game/interface/pregame-banner/pregame-banner.component';
import { DebugdummyComponent } from './components/debugdummy/debugdummy.component';
import { IngameRuleBookComponent } from './components/game/interface/menu-bar/ingame-rule-book/ingame-rule-book.component';
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
import { ItemsInterfaceComponent } from './components/game/interface/items-interface/items-interface.component';
import { HistoricResultsDisplayComponent } from './components/game/interface/menu-bar/vote-system/historic-results-display/historic-results-display.component';
import { VoteCreatorComponent } from './components/game/interface/menu-bar/vote-system/vote-creator/vote-creator.component';
import { PlayerIconComponent } from './components/framework/player-icon/player-icon.component';
import { AuthInterceptor } from './AuthInterceptor';
import { HomeComponent } from './components/home/home.component';
import { FaqComponent } from './components/home/faq/faq.component';
import { NewsComponent } from './components/home/news/news.component';
import { UpdatesComponent } from './components/home/updates/updates.component';
import { ProfileComponent } from './components/home/profile/profile.component';
import { SettingsComponent } from './components/home/settings/settings.component';
import { CustomEditorComponent } from './components/home/custom-editor/custom-editor.component';
import { ChatCommandListComponent } from './components/game/interface/menu-bar/home-register/chat-command-list/chat-command-list.component';
import { GameHistoryComponent } from './components/home/profile/gamehistory/gamehistory.component';
import { EditProfileComponent } from './components/home/profile/edit-profile/edit-profile.component';
import { MdContentComponent } from './components/home/md-content-list/md-content/md-content.component';
import { MdContentDirective } from './components/home/md-content-list/md-content.directive';
import { MdContentListComponent } from './components/home/md-content-list/md-content-list.component';
import { ResolveToHeadlinePipe } from './components/home/news/resolve-to-headline.pipe';
import { ImprintComponent } from './components/imprint/imprint.component';
import { ContactComponent } from './components/contact/contact.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppToastsComponent } from './components/toast/toast.component';
import { RomanNumeralsPipe } from './components/framework/roman-numerals.pipe';
import { CustomPopoverComponent } from './components/framework/custom-popover/custom-popover.component';
import { PrescriptPipe } from './components/game/interface/connected-players/prescript.pipe';
import { ShortcutOverlayComponent } from './components/game/interface/shortcut-overlay/shortcut-overlay.component';
import { IntroductionComponent } from './components/game/interface/introduction/introduction.component';
import { MenuSettingsComponent } from './components/game/interface/menu-bar/settings/menu-settings.component';
import { VolumeSlider } from './components/game/interface/menu-bar/settings/volume/volume-slider.component';
import { AvatarSectionComponent } from './components/game/interface/menu-bar/avatar-section/avatar-section.component';
import { BottleCapPickerComponent } from './components/game/interface/menu-bar/bottle-cap-picker/bottle-cap-picker.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { environment } from 'src/environments/environment';
import { GetLoginNamePipe } from './services/game-state-pipes/get-login-name.pipe';
import { GetDisplayNamePipe } from './services/game-state-pipes/get-display-name.pipe';
import { FilterReadyPlayersPipe } from './services/game-state-pipes/filter-ready-players.pipe';
import { CountPlayersPipe } from './services/game-state-pipes/count-players.pipe';
import { AsPlayerArrayPipe } from './services/game-state-pipes/as-player-array.pipe';
import { LogFromHTMLPipe } from './services/game-state-pipes/log-from-html.pipe';
import { CountAllVotesPipe } from './services/game-state-pipes/count-all-votes.pipe';
import { PlayerAffiliationPipe } from './services/game-state-pipes/player-affiliation.pipe';
import { AdminConsoleComponent } from './components/admin-console/admin-console.component';
import { RenderTestComponent } from './components/render-test/render-test.component';
const appRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'news', pathMatch: 'full' },
      { path: 'news', component: NewsComponent },
      { path: 'lobby', component: LobbyComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'updates', component: UpdatesComponent },
      {
        path: 'profile/:userId',
        component: ProfileComponent,
        children: [
          {
            path: 'gamehistory',
            component: GameHistoryComponent,
          },
        ],
      },
      { path: 'updates', component: UpdatesComponent },
      { path: 'custom', component: CustomEditorComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: PageNotFoundComponent },
      { path: 'report', component: PageNotFoundComponent },
      { path: 'imprint', component: ImprintComponent },
      { path: 'about', component: PageNotFoundComponent },
      { path: 'credits', component: PageNotFoundComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'bug', component: PageNotFoundComponent },
      { path: 'admin_console', component: AdminConsoleComponent },
      { path: 'render_test', component: RenderTestComponent },
    ],
  },
  { path: 'game', component: GameComponent },
];

// only enable _debug in dev mode
// default PageNotFound needs to be the last in array, so it has to be pushed as well
if (!environment.production) appRoutes.push({ path: '_debug', component: DebugdummyComponent });
appRoutes.push({ path: '**', component: PageNotFoundComponent });

@NgModule({
  declarations: [
    AppComponent,
    GameDisplayComponent,
    LoginComponent,
    RulesComponent,
    GifViewerComponent,
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
    PlayerIconComponent,
    HomeComponent,
    FaqComponent,
    NewsComponent,
    UpdatesComponent,
    ProfileComponent,
    SettingsComponent,
    CustomEditorComponent,
    ChatCommandListComponent,
    GameHistoryComponent,
    EditProfileComponent,
    MdContentComponent,
    MdContentDirective,
    MdContentListComponent,
    ResolveToHeadlinePipe,
    ContactComponent,
    AppToastsComponent,
    RomanNumeralsPipe,
    CustomPopoverComponent,
    PrescriptPipe,
    ShortcutOverlayComponent,
    IntroductionComponent,
    MenuSettingsComponent,
    VolumeSlider,
    AvatarSectionComponent,
    BottleCapPickerComponent,
    GetLoginNamePipe,
    GetDisplayNamePipe,
    FilterReadyPlayersPipe,
    CountPlayersPipe,
    AsPlayerArrayPipe,
    LogFromHTMLPipe,
    CountAllVotesPipe,
    PlayerAffiliationPipe,
    AdminConsoleComponent,
    RenderTestComponent,
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes, // ,{ enableTracing: true } // <-- debugging purposes only
      { relativeLinkResolution: 'legacy', anchorScrolling: 'enabled' }
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
    ReactiveFormsModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatSlideToggleModule,
    CdkStepperModule,
    NgbModule,
    FontAwesomeModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'de' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
