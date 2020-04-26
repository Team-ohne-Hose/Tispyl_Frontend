import {AfterContentInit, Component, OnInit, ViewChild} from '@angular/core';
import {ColyseusClientService} from '../services/colyseus-client.service';
import {InterfaceComponent} from '../interface/interface.component';
import {GameState} from '../model/state/GameState';

@Component({
  selector: 'app-debugdummy',
  templateUrl: './debugdummy.component.html',
  styleUrls: ['./debugdummy.component.css']
})
export class DebugdummyComponent implements OnInit, AfterContentInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
  }


}
