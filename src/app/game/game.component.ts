import {Component, HostListener, OnInit} from '@angular/core';
import {CameraService} from '../camera.service';
import {Camera, Vector3} from 'three';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor() { }

  cameraControl: CameraService;
  addMarker: (x: number, y: number, z: number, col: number) => void;
  curField = -1;

  ngOnInit(): void {
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
        //this.cameraControl.zoomToField(Number(event.key));
        const center: {x: number, y: number} = this.cameraControl.getFieldCenter(Number(event.key));
        const corners: {x1: number, y1: number, x2: number, y2: number} = this.cameraControl.getFieldCoords(Number(event.key));
        this.addMarker(center.x, 0, center.y, 0xff0000);
        this.addMarker(corners.x1, 0, corners.y1, 0xff4400);
        this.addMarker(corners.x1, 0, corners.y2, 0xff4400);
        this.addMarker(corners.x2, 0, corners.y1, 0xff4400);
        this.addMarker(corners.x2, 0, corners.y2, 0xff4400);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        const p: Vector3 = this.cameraControl.getCurrentPosition();
        console.log('Camera At: ', p.x, p.y, p.z);
        break;
      case 'm':
        this.curField++;
        if (this.curField >= 64) {
          this.curField = 0;
        }
        const center2: {x: number, y: number} = this.cameraControl.getFieldCenter(this.curField);
        const corners2: {x1: number, y1: number, x2: number, y2: number} = this.cameraControl.getFieldCoords(this.curField);
        this.addMarker(center2.x, 0, center2.y, 0xff0000);
        this.addMarker(corners2.x1, 0, corners2.y1, 0x034400);
        this.addMarker(corners2.x1, 0, corners2.y2, 0x034400);
        this.addMarker(corners2.x2, 0, corners2.y1, 0x034400);
        this.addMarker(corners2.x2, 0, corners2.y2, 0x034400);
        break;
    }
  }

  registerViewport(tuple: [Camera, (x: number, y: number, z: number, col: number) => void]) {
    this.cameraControl = new CameraService(tuple[0]);
    this.addMarker = tuple[1];
  }

}
