import { Injectable } from '@angular/core';
import { TextContainer } from '../../model/TextContainer';
import translationData from './translations.json';

export class Translation {
  id: string;
  cname: string;
  text: TextContainer;
}

@Injectable({
  providedIn: 'root',
})
/**
 * @deprecated This service should be replaced by an actual translations system if we get around to it.
 */
export class TranslationService {
  static getTranslations(lang: string): Translation {
    return translationData[lang] || translationData['en'];
  }
}
