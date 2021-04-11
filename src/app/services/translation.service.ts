import { Injectable } from '@angular/core';
import { TextContainer } from '../model/TextContainer';
// @ts-ignore
import translationData from '../resources/translations.json';

export class Translation {
  id: String;
  cname: String;
  text: TextContainer;
}


@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor() {
  }

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
