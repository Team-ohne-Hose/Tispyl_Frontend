import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {GameState} from '../../model/state/GameState';
import {ColyseusClientService} from '../../services/colyseus-client.service';
import {MapSchema} from '@colyseus/schema';
import {Player} from '../../model/state/Player';
import {UserService} from '../../services/user.service';
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

  imageSource = '';

  constructor(private userManagement: UserService, private fileManagement: FileService) {
    this.userManagement.getActiveUser().subscribe( u => {
      this.imageSource = this.fileManagement.profilePictureSource(u);
    });
  }
}
