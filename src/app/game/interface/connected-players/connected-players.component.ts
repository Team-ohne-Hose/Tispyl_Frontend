import {Component, Input} from '@angular/core';
import {Player} from '../../../model/state/Player';
import {FileService} from '../../../services/file.service';
import {ColyseusNotifyable} from '../../../services/game-initialisation.service';
import {MessageType, WsData} from '../../../model/WsData';
import {GameStateService} from '../../../services/game-state.service';


@Component({
  selector: 'app-connected-players',
  templateUrl: './connected-players.component.html',
  styleUrls: ['./connected-players.component.css']
})
export class ConnectedPlayersComponent implements ColyseusNotifyable {

  @Input()
  players: Player[];

  @Input()
  currentPlayerDisplayName: string;

  profilePics = {};

  constructor(private fileManagement: FileService, private gameState: GameStateService) {}

  attachColyseusMessageCallbacks(gameState: GameStateService): void {
    gameState.registerMessageCallback(MessageType.REFRESH_COMMAND, {
      filterSubType: -1,
      f: (data: WsData) => {
        if (data.type === MessageType.REFRESH_COMMAND) {
          for (const key in this.profilePics) {
            if (key in this.profilePics) {
              this.profilePics[key] = this.fileManagement.profilePictureSource(key);
            }
          }
        }
      }
    });
  }
  attachColyseusStateCallbacks(gameState: GameStateService): void {}

  getProfilePic(name) {
    if (this.profilePics[name] === undefined) {
      this.profilePics[name] = this.fileManagement.profilePictureSource(name);
    }
    return this.profilePics[name];

    // HACK !
    // return this.fileManagement.tameProfilePictureSource(name);
  }
  filterConnectedPlayers(value: Player, index: number, list: Player[]): boolean {
    return !value.hasLeft;
  }

}
