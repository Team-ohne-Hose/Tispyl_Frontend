import { GameBoardOrbitControl } from './GameBoardOrbitControl';
import { MouseInteraction } from './MouseInteraction';
import { AudioControl } from './AudioControl';
import { BoardItemControlService } from '../../../../services/board-item-control.service';
import { KeyboardInteraction } from './KeyboardInteraction';
import { GameSettingsService } from 'src/app/services/game-settings.service';

export class UserInteractionController {
  mouseInteractions: MouseInteraction;
  keyboardInteractions: KeyboardInteraction;
  cameraControls: GameBoardOrbitControl;
  audioControls: AudioControl;

  constructor(public bic: BoardItemControlService, public GSS: GameSettingsService) {
    this.mouseInteractions = new MouseInteraction(bic);
    this.cameraControls = new GameBoardOrbitControl(bic.camera, bic.rendererDomReference);
    this.keyboardInteractions = new KeyboardInteraction(bic, this.cameraControls);
    this.audioControls = new AudioControl(GSS);
    bic.camera.add(this.audioControls.listener);
  }
}
