import { BoardItemControlService } from 'src/app/services/board-item-control.service';
import { GameBoardOrbitControl } from './GameBoardOrbitControl';

export enum KEY_EVENT {
  TAB = 'Tab',
  KEY_W = 'w',
  KEY_S = 's',
  KEY_A = 'a',
  KEY_D = 'd',
}

let timerVertical = undefined;
let timerHorizontal = undefined;

let timerVerticalKey = undefined;
let timerHorizontalKey = undefined;

export class KeyboardInteraction {
  cameraControls: GameBoardOrbitControl;

  constructor(private bic: BoardItemControlService, cameraControls: GameBoardOrbitControl) {
    this.cameraControls = cameraControls;
  }

  keyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case KEY_EVENT.TAB:
        event.preventDefault();
        this.bic.showNameTags(true);
        break;
      case KEY_EVENT.KEY_W:
        if (timerVertical === undefined) {
          this.cameraControls.moveForward();
          timerVerticalKey = KEY_EVENT.KEY_W;

          timerVertical = setInterval(
            (() => {
              this.cameraControls.moveForward();
            }).bind(this),
            20
          );
        }
        break;
      case KEY_EVENT.KEY_S:
        if (timerVertical === undefined) {
          this.cameraControls.moveBackward();
          timerVerticalKey = KEY_EVENT.KEY_S;

          timerVertical = setInterval(
            (() => {
              this.cameraControls.moveBackward();
            }).bind(this),
            20
          );
        }
        break;
      case KEY_EVENT.KEY_A:
        if (timerHorizontal === undefined) {
          this.cameraControls.moveLeft();
          timerHorizontalKey = KEY_EVENT.KEY_A;

          timerHorizontal = setInterval(
            (() => {
              this.cameraControls.moveLeft();
            }).bind(this),
            20
          );
        }
        break;

      case KEY_EVENT.KEY_D:
        if (timerHorizontal === undefined) {
          this.cameraControls.moveRight();
          timerHorizontalKey = KEY_EVENT.KEY_D;

          timerHorizontal = setInterval(
            (() => {
              this.cameraControls.moveRight();
            }).bind(this),
            20
          );
        }
        break;
      default: {
        //Do nothing if key is pressed and not defined.
      }
    }
  }

  keyUp(event: KeyboardEvent): void {
    switch (event.key) {
      case KEY_EVENT.TAB:
        this.bic.showNameTags(false);
        break;

      case KEY_EVENT.KEY_A:
      case KEY_EVENT.KEY_D:
        if (timerHorizontalKey === event.key) {
          clearInterval(timerHorizontal);
          timerHorizontal = undefined;
        }
        break;

      case KEY_EVENT.KEY_W:
      case KEY_EVENT.KEY_S: {
        if (timerVerticalKey === event.key) {
          clearInterval(timerVertical);
          timerVertical = undefined;
        }
        break;
      }
      default: {
        //Do nothing if key is released and not defined.
      }
    }
  }
}
