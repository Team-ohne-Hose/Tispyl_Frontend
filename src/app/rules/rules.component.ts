import {Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input('testText') testText: { };
  bulletPoints = [
    {icon:'fas fa-beer', key:'rule1'},
    {icon:'fas fa-ruler-combined', key:'rule2'},
    {icon:'fas fa-microphone-alt-slash', text:'~'},
    {icon:'fas fa-dollar-sign', text:'~'},
    {icon:'fas fa-transgender', text:'~'},
    {icon:'fas fa-user-friends', text:'~'},
    {icon:'fas fa-balance-scale', text:'~'}
  ]

}
