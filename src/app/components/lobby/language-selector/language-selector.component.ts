import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent implements OnInit {

  languageList = [];
  @Output() changeLang = new EventEmitter<String>();
  //flag resources from http://www.iconarchive.com/show/flags-icons-by-wikipedia.2.html

  constructor() {
    this.languageList = TranslationService.getTranslationNames();
  }

  ngOnInit() {

  }

  selectLang(lang: String) {
    console.log('selecting Language: ', lang);
    this.changeLang.emit(lang);
  }
}


