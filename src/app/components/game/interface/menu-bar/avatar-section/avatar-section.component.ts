import { Component } from '@angular/core';
import { Observable, combineLatest, filter, map, share, take } from 'rxjs';
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

  // subscriptions
  protected timePlayed$: Observable<string>;
  protected role$: Observable<string>;

  constructor(private fileService: FileService, private userService: UserService, protected gameStateService: GameStateService) {
    this.timePlayed$ = this.userService.activeUser
      .pipe(filter((user: BasicUser) => user !== undefined))
      .pipe(
        map((user: BasicUser) => {
          const min = user.time_played;
          return `${Math.floor(min / 60)} hours ${Math.floor(min % 60)} minutes`;
        })
      )
      .pipe(share());

    this.role$ = combineLatest({
      currentUser: this.userService.activeUser.pipe(filter((user: BasicUser) => user !== undefined)),
      isHost: this.gameStateService.amIHost$(),
    })
      .pipe(
        map((value: { currentUser: BasicUser; isHost: boolean }) => {
          if (value.isHost) {
            return 'Host';
          } else if (value.currentUser.is_dev) {
            return 'Dev';
          } else {
            return 'Player';
          }
        })
      )
      .pipe(share());
  }

  changeImage(event: { target: HTMLInputElement }): void {
    const file = event.target?.files[0];
    if (file !== undefined) {
      this.gameStateService
        .getMe$()
        .pipe(take(1))
        .subscribe((me: Player) => {
          this.fileService.uploadProfilePictureByLoginName(file, me.loginName).subscribe((suc) => {
            console.log('Uploaded new profile picture: ', suc);

            this.userImageUrl = this.fileService.profilePictureSource(me.loginName, true);
            const msg: RefreshProfilePics = {
              type: MessageType.REFRESH_COMMAND,
              subType: RefreshCommandType.refreshProfilePic,
            };
            this.gameStateService.sendMessage(MessageType.REFRESH_COMMAND, msg);
          });
        });
    }
  }
}
