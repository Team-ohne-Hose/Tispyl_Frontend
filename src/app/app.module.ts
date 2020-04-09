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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MessageComponent } from './message/message.component';

@NgModule({
  declarations: [
    AppComponent,
    GameDisplayComponent,
    LoginComponent,
    RegisterComponent,
    RulesComponent,
    GifViewerComponent,
    LanguageSelectorComponent,
    MessageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
