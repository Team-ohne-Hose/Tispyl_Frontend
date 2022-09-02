import { Component } from '@angular/core';
import { Player } from 'src/app/model/state/Player';
import { MessageType, RefreshCommandType, RefreshProfilePics } from 'src/app/model/WsData';
import { FileService } from 'src/app/services/file.service';
import { GameStateService } from 'src/app/services/game-state.service';
import { BasicUser, UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-menu-avatar',
  templateUrl: './avatar-section.component.html',
  styleUrls: ['./avatar-section.component.css'],
})
export class AvatarSectionComponent {
  userImageUrl = '../assets/defaultImage.jpg';

  private user: BasicUser;
  public currentPlayer: Player;

  constructor(private fileService: FileService, private userService: UserService, private gameStateService: GameStateService) {
    this.user = this.userService.activeUser.getValue();
    this.currentPlayer = this.gameStateService.getMe();
    this.userImageUrl = this.fileService.profilePictureSource(this.gameStateService.getMe().loginName, true);
  }

  changeImage(event: { target: HTMLInputElement }): void {
    const file = event.target?.files[0];
    if (file !== undefined) {
      this.fileService.uploadProfilePicture(file, this.user).subscribe((suc) => {
        console.log('Uploaded new profile picture: ', suc);

        this.userImageUrl = this.fileService.profilePictureSource(this.gameStateService.getMe().loginName, true);
        const msg: RefreshProfilePics = {
          type: MessageType.REFRESH_COMMAND,
          subType: RefreshCommandType.refreshProfilePic,
        };
        this.gameStateService.sendMessage(MessageType.REFRESH_COMMAND, msg);
      });
    }
  }

  getRole(): string {
    if (this.currentPlayer === undefined) {
      return 'undefined';
    } else if (this.currentPlayer.isCurrentHost) {
      return 'Host';
    } else if (this.user.is_dev) {
      return 'Dev';
    } else {
      return 'Player';
    }
  }

  getTimePlayed(): string {
    if (this.user !== undefined) {
      const min = this.user.time_played;
      return `${Math.floor(min / 60)} hours ${Math.floor(min % 60)} minutes`;
    } else {
      return '0 hours 0 minutes';
    }
  }
}
