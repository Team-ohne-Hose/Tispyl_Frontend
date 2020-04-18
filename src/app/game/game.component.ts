import {Component, HostListener, OnInit} from '@angular/core';
import {Quaternion, Vector3} from 'three';
import {BoardItemManagment} from './viewport/BoardItemManagment';
import {AudioControl} from './viewport/AudioControl';
import {CameraControl} from './viewport/CameraControl';
import {BoardCoordConversion} from './viewport/BoardCoordConversion';
import {filter, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ColyseusClientService} from '../services/colyseus-client.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  state$: Observable<object>;

  constructor(public activatedRoute: ActivatedRoute, private router: Router, private colyseus: ColyseusClientService) {}

  cameraControl: CameraControl;
  boardItemControl: BoardItemManagment;
  audioCtrl: AudioControl;

  curField = -1;

  ngOnInit(): void {
      this.state$ = this.activatedRoute.paramMap
        .pipe(map(() => {
          console.log('STATE', window.history.state);
          return window.history.state;
        }));
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

  debug(ev) {
    this.state$.subscribe( s => {
      console.log(s);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    console.log('Key: ', event);
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
        this.audioCtrl.playAudio();
        break;
    }
  }

  registerViewport(tuple: [CameraControl, BoardItemManagment, AudioControl]) {
    this.cameraControl = tuple[0];
    this.boardItemControl = tuple[1];
    this.audioCtrl = tuple[2];
  }

}
