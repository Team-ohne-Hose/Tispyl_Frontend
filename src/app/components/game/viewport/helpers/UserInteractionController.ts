import { GameBoardOrbitControl } from './GameBoardOrbitControl';
import { MouseInteraction } from './MouseInteraction';
import { AudioControl } from './AudioControl';
import { BoardItemControlService } from '../../../../services/board-item-control.service';

export class UserInteractionController {
  mouseInteractions: MouseInteraction;
  cameraControls: GameBoardOrbitControl;
  audioControls: AudioControl;

  constructor(private bic: BoardItemControlService) {
    this.mouseInteractions = new MouseInteraction(bic);
    this.cameraControls = new GameBoardOrbitControl(bic.camera, bic.rendererDomReference);
    this.audioControls = new AudioControl();
    bic.camera.add(this.audioControls.listener);
  }
}
