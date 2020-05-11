import {Component, Input} from '@angular/core';
import {Player} from '../../model/state/Player';
import {FileService} from '../../services/file.service';

@Component({
  selector: 'app-connected-players',
  templateUrl: './connected-players.component.html',
  styleUrls: ['./connected-players.component.css']
})
export class ConnectedPlayersComponent {

  @Input()
  players: Player[];

  @Input()
  currentPlayerDisplayName: string;

  constructor(private fileManagement: FileService) {}

  getProfilePic(name) {
    // HACK !
    return this.fileManagement.tameProfilePictureSource(name);
  }
}
