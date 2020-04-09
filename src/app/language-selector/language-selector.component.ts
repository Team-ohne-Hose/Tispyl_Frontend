import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { TranslationService } from 'src/app/translation.service';
import {Game} from '../model/Game';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent implements OnInit {

  constructor() {
    this.languageList = TranslationService.getTranslationNames();
  }
  languageList = [];

  @Output() changeLang = new EventEmitter<String>();

  ngOnInit() {

  }

  selectLang(lang: String) {
    console.log('selecting Language: ', lang);
    this.changeLang.emit(lang);
  }
}


