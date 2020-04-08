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
    {icon:'fas fa-glass-cheers', key:'rule2'}
  ]



}
