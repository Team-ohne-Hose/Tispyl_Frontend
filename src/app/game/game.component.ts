import {Component, OnInit, ViewChild} from '@angular/core';
import {BoardItemManagement} from './viewport/BoardItemManagement';
import {AudioControl} from './viewport/AudioControl';
import {CameraControl} from './viewport/CameraControl';
import {Router} from '@angular/router';
import {ColyseusClientService} from '../services/colyseus-client.service';
import {ViewportComponent} from './viewport/viewport.component';
import {GameAction, GameActionType, MessageType} from '../model/WsData';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor(private router: Router, private colyseus: ColyseusClientService) {}

  @ViewChild('viewRef') viewRef: ViewportComponent;

  // might be obsolete in the future
  cameraControl: CameraControl;
  boardItemControl: BoardItemManagement;
  audioCtrl: AudioControl;

  ngOnInit(): void {
      this.colyseus.getActiveRoom().subscribe((myRoom) => {
        console.log('connected to Room:', myRoom);
        if (myRoom === undefined) {
          this.router.navigateByUrl('/lobby');
        } else {
          const msg: GameAction = {
            type: MessageType.GAME_MESSAGE,
            action: GameActionType.refreshData
          };
          myRoom.send(msg);
        }
      }, (errRoom) => {
        console.log('ErrorRoom is', errRoom);
        this.router.navigateByUrl('/lobby');
      });
  }

  registerViewport(tuple: [CameraControl, BoardItemManagement, AudioControl]) {
    this.cameraControl = tuple[0];
    this.boardItemControl = tuple[1];
    this.audioCtrl = tuple[2];
  }

}
