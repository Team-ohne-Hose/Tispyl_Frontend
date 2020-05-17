import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HintsService {

  private readonly hints: string[] = [
    'Wirf den Würfel nicht vom Tisch, denn dann musst du trinken!',
    'Alkohol kann dich betrunken machen!',
    'Um voranzuschreiten musst du würfeln!',
    'Hohe Würfelwürfe bringen dich weiter! Also meistens zumindest!',
    'Vermeide das Neustart Feld!',
    'Nimm bei Schere, Stein, Papier immer Stein!',
    'Falls du beim Spielen ins Saufkoma gefallen bist, kannst du einfach wieder beitreten und weiterspielen!',
    'Ein paar Hopfen-Torpedos gehen immer!',
    'Das ist kein Tipp!',
    'Das sind nicht die Tipps die sie suchen!',
    '42',
    'Mit dem High-Ground hast du quasi schon gewonnen!',
    'Eine 6 im Geburtstag zu haben ist Unvorteilhaft. Mehrere 6 sind aber echt beschissen!',
    'Die Ältesten dürfen am meisten trinken!',
    '7 ist eine Primzahl!',
    'Den Kopf gegen die Wand zu schlagen verbrennt 150 Kalorien!',
    'Das liest doch so oder so niemand..',
    'Rückwärts laufen ist meistens nicht so gut wie vorwärts laufen!',
    'Niemand hält dich davon ab, auch zwischen den Aktionen zu trinken!',
    'Halte die Fenster geschlossen, wenn die Chemtrail-Helis mit dem Desinfektionsmittel kommen!',
    'Wer das liest ist doof!',
    'Im Tischspiel kann man beim rückwärtslaufen nicht an kleinen Ecken hängenbleiben!',
    'Nimm dich vor den russischen Hackern in acht!',
    'Wer das liest muss trinken!'
  ];


  constructor() { }


  getRandomHint(): string {
    return this.hints[Math.max(Math.min(Math.floor(Math.random() * this.hints.length), this.hints.length - 1), 0)];
  }
}