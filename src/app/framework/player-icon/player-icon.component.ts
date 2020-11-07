import {Component, Input, AfterViewInit, OnInit} from '@angular/core';
import {Player} from '../../model/state/Player';
import {FileService} from '../../services/file.service';
import {GameStateService} from '../../services/game-state.service';
import {MessageType, RefreshCommandType, RefreshProfilePics} from '../../model/WsData';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-player-icon',
  templateUrl: './player-icon.component.html',
  styleUrls: ['./player-icon.component.css']
})
export class PlayerIconComponent implements OnInit {

  @Input()
  size: string = '100px';
  @Input()
  borderThickness: string = '10px';

  defaultImage: string = '../../assets/defaultImage.jpg';
  currentSource: string;

  @Input()
  player: Player = undefined;

  @Input()
  loginName: string = undefined;

  @Input()
  enableUpload: boolean = false;

  constructor(
    private fileManagement: FileService,
    private gameState: GameStateService,
    private userManagement: UserService) {}

  uploadImageFile(event) {
    const file = event.target.files[0];
    if (this.player !== undefined) {
      this.userManagement.getUserByLoginName(this.player.loginName).subscribe( usr => {
        this.fileManagement.uploadProfilePicture(file, usr).subscribe(suc => {
          console.log('Uploaded new profile picture: ', suc);
          this.currentSource = this.fileManagement.profilePictureSource(this.player.loginName);
          const msg: RefreshProfilePics = {type: MessageType.REFRESH_COMMAND,
            subType: RefreshCommandType.refreshProfilePic};
          this.gameState.sendMessage(MessageType.REFRESH_COMMAND, msg);
        });
      });
    }
  }

  ngOnInit(): void {
    if (this.player !== undefined) {
      this.currentSource = this.fileManagement.profilePictureSource(this.player.loginName);
    } else if (this.loginName !== undefined) {
      this.currentSource = this.fileManagement.profilePictureSource(this.loginName);
    } else {
      this.currentSource = this.defaultImage;
    }
  }


}
