import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  bulletPoints = [
    {icon:'fas fa-beer', text:'Everybody positions their drink on any tile of the playing field. If somebody visits this tile, the owner of the drink drinks one ration.'},
    {icon:'fas fa-ruler-combined', text:'One ration equal two sips or one shot. A given drink should be empty by the 10th sip.'},
    {icon:'fas fa-microphone-alt-slash', text:'~'},
    {icon:'fas fa-dollar-sign', text:'~'},
    {icon:'fas fa-transgender', text:'~'},
    {icon:'fas fa-user-friends', text:'~'},
    {icon:'fas fa-balance-scale', text:'~'}
  ]

}
