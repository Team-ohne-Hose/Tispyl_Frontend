import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../../model/GameState';

@Component({
  selector: 'app-pregame-banner',
  templateUrl: './pregame-banner.component.html',
  styleUrls: ['./pregame-banner.component.css']
})
export class PregameBannerComponent implements OnInit {

  isReady = false;

  @Input()
  players: Player[];

  constructor() { }

  ngOnInit(): void {
  }

}
