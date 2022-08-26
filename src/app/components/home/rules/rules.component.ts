import { Component } from '@angular/core';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css'],
})
export class RulesComponent {
  bulletPoints = [
    {
      icon: 'fas fa-beer',
      key: 'rule1',
      text:
        'Jeder Spieler platziert sein Getränk auf ein beliebiges Spielfeld. ' +
        'Betritt ein Spieler dieses Feld, so muss der Getränkebesitzer einen Trinken.',
    },
    {
      icon: 'fas fa-ruler-combined',
      key: 'rule2',
      text:
        'Es wird immer in Rationen getrunken. Eine Ration entspricht zwei ' +
        'Schlücken oder einem Shot. 0,5L (0,004 Badewannen) sind in maximal 10 Schlücken zu leeren!',
    },
    {
      icon: 'fas fa-microphone-alt-slash',
      key: 'rule3',
      text: 'Negative Kritik am Spiel ist als Regelverstoß (2 Rationen) zu werten!',
    },
    {
      icon: 'fas fa-dollar-sign',
      key: 'rule4',
      text: 'Alle Aufgaben müssen versucht werden. Schaffst du es nicht, trinkst du zwei Strafrationen!',
    },
    {
      icon: 'fas fa-transgender',
      key: 'rule5',
      text: 'Regeln und Aktionen gelten immer bis Ende des Spiels, falls Sie nicht explizit aufgelöst werden!',
    },
    {
      icon: 'fas fa-user-friends',
      key: 'rule6',
      text: 'An Abstimmungen müssen alle teilnehmen außer dem Auslöser. Bei Gleichstand darf der Auslöser entscheiden!',
    },
    {
      icon: 'fas fa-balance-scale',
      key: 'rule7',
      text: 'Wer mitspielt akzeptiert damit alle Regeln!',
    },
  ];
}
