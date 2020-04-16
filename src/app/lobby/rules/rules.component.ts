import {Component, Input, OnInit } from '@angular/core';
import {TextContainer} from '../../model/TextContainer';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() languageObjects: TextContainer;
  bulletPoints = [
    {icon:'fas fa-beer', key:'rule1'},
    {icon:'fas fa-ruler-combined', key:'rule2'},
    {icon:'fas fa-microphone-alt-slash', key:'rule3'},
    {icon:'fas fa-dollar-sign', key:'rule4'},
    {icon:'fas fa-transgender', key:'rule5'},
    {icon:'fas fa-user-friends', key:'rule6'},
    {icon:'fas fa-balance-scale', key:'rule7'}
  ]

}
