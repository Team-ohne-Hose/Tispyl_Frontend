import { Component, OnInit } from '@angular/core';
import { Translation } from '../../../services/translation.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  translation: Translation;

  constructor() { }

  ngOnInit(): void {
    this.translation = TranslationService.getTranslations('en');
  }

}
