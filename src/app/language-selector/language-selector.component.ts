import { Component, OnInit } from '@angular/core';
import { TranslationService } from 'src/app/translation.service';

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
  menuShown = '';
  value = 'en';

  ngOnInit() {

  }

  toggleDropdown() {
    if (this.menuShown === '') {
      this.menuShown = 'menuItemsVisible';
    } else {
      this.menuShown = '';
    }
  }
  selectLang() {
    console.log('selecting Language: ', this.value);
  }
}


