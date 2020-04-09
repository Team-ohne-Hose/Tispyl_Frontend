import { Injectable } from '@angular/core';
// @ts-ignore
import translationData from './translations.json';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor() { }

  static getTranslations(lang: String): {} {
    return translationData[lang] || translationData['en'];
  }
  static getTranslationNames() {
    const res = [];
    for (const tName in translationData) {
      if (translationData.hasOwnProperty(tName)) {
        res.push({id: translationData[tName].id, desc: translationData[tName].cname});
      }
    }
    console.log('QueryNames:', res);
    return res;
  }
}
