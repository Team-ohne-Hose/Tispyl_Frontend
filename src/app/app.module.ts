import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameDisplayComponent } from './game-display/game-display.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RulesComponent } from './rules/rules.component';
import { GifViewerComponent } from './gif-viewer/gif-viewer.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    GameDisplayComponent,
    LoginComponent,
    RegisterComponent,
    RulesComponent,
    GifViewerComponent,
    LanguageSelectorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
