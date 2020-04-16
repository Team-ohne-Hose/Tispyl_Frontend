import {Component, HostListener, OnInit} from '@angular/core';
import {Quaternion, Vector3} from 'three';
import {BoardItemManagment} from './viewport/BoardItemManagment';
import {AudioControl} from './viewport/AudioControl';
import {CameraControl} from './viewport/CameraControl';
import {BoardCoordConversion} from './viewport/BoardCoordConversion';
import {filter, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  state$: Observable<object>;

  constructor(public activatedRoute: ActivatedRoute, private router: Router) {}

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
        const slightAdj = 4.5 - Math.abs(param - 4.5);
        const pos = new Vector3(0, -10 * param, 0);
        this.cameraControl.lookAtPosition(pos, new Vector3(0, -1,  - 1), 40 + 10 * param);
        this.boardItemControl.addMarker(pos.x, pos.y, pos.z, 0x00df4b);
        break;

      case 'i':
        this.cameraControl.lookAtPosition(new Vector3(0, -10, 0), new Vector3(0, -1, -1), 50);
        this.boardItemControl.addMarker(pos.x, pos.y, pos.z, 0x00df4b);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        const p: Vector3 = this.cameraControl.getPosition();
        console.log('Camera At: ', p.x, p.y, p.z);
        break;
      case 'm':
        this.curField++;
        if (this.curField >= 64) {
          this.curField = 0;
        }
        const center2: {x: number, y: number} = BoardCoordConversion.getFieldCenter(this.curField);
        const corners2: {x1: number, y1: number, x2: number, y2: number} = BoardCoordConversion.getFieldCoords(this.curField);
        this.boardItemControl.addMarker(center2.x, 0, center2.y, 0xff0000);
        this.boardItemControl.addMarker(corners2.x1, 0, corners2.y1, 0x034400);
        this.boardItemControl.addMarker(corners2.x1, 0, corners2.y2, 0x034400);
        this.boardItemControl.addMarker(corners2.x2, 0, corners2.y1, 0x034400);
        this.boardItemControl.addMarker(corners2.x2, 0, corners2.y2, 0x034400);
        break;
      case 'o':
        this.audioCtrl.playAudio();
        break;
      case 'l':
        console.log('zoom: ', this.cameraControl.cam.zoom);
        console.log('focus: ', this.cameraControl.cam.focus);
        const quat = new Quaternion().setFromUnitVectors( this.cameraControl.cam.up, new Vector3(0, 1, 0));
        console.log('quat: ', quat);
    }
  }

  registerViewport(tuple: [CameraControl, BoardItemManagment, AudioControl]) {
    this.cameraControl = tuple[0];
    this.boardItemControl = tuple[1];
    this.audioCtrl = tuple[2];
  }

}
