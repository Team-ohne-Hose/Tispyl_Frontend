import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../../../model/state/Player';
import { FileService } from '../../../services/file.service';
import { GameStateService } from '../../../services/game-state.service';
import { MessageType, RefreshCommandType, RefreshProfilePics } from '../../../model/WsData';
import { UserService } from '../../../services/user.service';
import { FileChangeEvent } from '@angular/compiler-cli/src/perform_watch';

@Component({
  selector: 'app-player-icon',
  templateUrl: './player-icon.component.html',
  styleUrls: ['./player-icon.component.css'],
})
export class PlayerIconComponent implements OnInit {
  @Input()
  size = '100px';

  @Input()
  borderThickness = '10px';

  defaultImage = '../../assets/defaultImage.jpg';
  currentSource: string;

  @Input()
  player: Player = undefined;

  @Input()
  loginName: string = undefined;

  @Input()
  enableUpload = false;

  constructor(
    private fileManagement: FileService,
    private gameState: GameStateService,
    private userManagement: UserService
  ) {}

  uploadImageFile(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target?.files[0];
    if (this.player !== undefined && file !== undefined) {
      this.userManagement.getUserByLoginName(this.player.loginName).subscribe((userResponse) => {
        this.fileManagement.uploadProfilePicture(file, userResponse.payload).subscribe((suc) => {
          console.log('Uploaded new profile picture: ', suc);
          this.currentSource = this.fileManagement.profilePictureSource(this.player.loginName);
          const msg: RefreshProfilePics = {
            type: MessageType.REFRESH_COMMAND,
            subType: RefreshCommandType.refreshProfilePic,
          };
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
