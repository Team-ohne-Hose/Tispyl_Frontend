import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {Quaternion, Vector3} from 'three';
import {BoardItemManagement} from './viewport/BoardItemManagement';
import {AudioControl} from './viewport/AudioControl';
import {CameraControl} from './viewport/CameraControl';
import {BoardCoordConversion} from './viewport/BoardCoordConversion';
import {filter, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ColyseusClientService} from '../services/colyseus-client.service';
import {ViewportComponent} from './viewport/viewport.component';

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
        console.log('Room is', myRoom);
        if (myRoom === undefined) {
          this.router.navigateByUrl('/lobby');
        }
      }, (errRoom) => {
        console.log('ErrorRoom is', errRoom);
        this.router.navigateByUrl('/lobby');
      });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        let param = Number(event.key);
        if (param === 0) {
          param = 10;
        }
        param--;
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        const p: Vector3 = this.cameraControl.getPosition();
        console.log('Camera At: ', p.x, p.y, p.z);
        break;
      case 'p':
        this.boardItemControl.listDebugPhysicsItems();
        break;
      case 'o':
        // this.audioCtrl.playAudio();
        break;
    }
  }

  registerViewport(tuple: [CameraControl, BoardItemManagement, AudioControl]) {
    this.cameraControl = tuple[0];
    this.boardItemControl = tuple[1];
    this.audioCtrl = tuple[2];
  }

}
