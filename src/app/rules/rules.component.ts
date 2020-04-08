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
    {icon:'fas fa-glass-cheers', text:'One ration equal two sips or one shot. A given drink should be empty by the 10th sip'}
  ]



}
