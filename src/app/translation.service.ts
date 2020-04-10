import { Injectable } from '@angular/core';
// @ts-ignore
import translationData from './resources/translations.json';
import {Translation} from './model/Translation';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor() { }

  static getTranslations(lang: string): Translation {
    return translationData[lang] || translationData['en'];
  }
  static getTranslationNames() {
    const res = [];
    for (const tName in translationData) {
      if (translationData.hasOwnProperty(tName)) {
        res.push({id: translationData[tName].id, desc: translationData[tName].cname, flag: translationData[tName].flag});
      }
    }
    return res;
  }
}
