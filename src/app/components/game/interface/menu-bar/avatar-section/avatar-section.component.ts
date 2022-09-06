import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription, map } from 'rxjs';
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
export class AvatarSectionComponent implements OnDestroy {
  userImageUrl = '../assets/defaultImage.jpg';

  protected currentPlayer: Player;
  private currentUser: BasicUser;

  // subscriptions
  private currentPlayer$$: Subscription;
  private currentUser$$: Subscription;
  protected currentPlayerLogin$: Observable<string>;

  constructor(private fileService: FileService, private userService: UserService, private gameStateService: GameStateService) {
    this.currentPlayer$$ = this.gameStateService.me$.subscribe((player: Player) => {
      this.currentPlayer = player;
    });
    this.currentUser$$ = this.userService.activeUser.subscribe((user: BasicUser) => {
      this.currentUser = user;
    });

    this.currentPlayerLogin$ = this.gameStateService.me$.pipe(
      map((player: Player) => {
        return player.loginName;
      })
    );

    this.userImageUrl = this.fileService.profilePictureSource(this.currentPlayer.loginName, true);
  }

  public ngOnDestroy() {
    this.currentPlayer$$.unsubscribe();
    this.currentUser$$.unsubscribe();
  }

  changeImage(event: { target: HTMLInputElement }): void {
    const file = event.target?.files[0];
    if (file !== undefined) {
      this.fileService.uploadProfilePictureByLoginName(file, this.currentPlayer.loginName).subscribe((suc) => {
        console.log('Uploaded new profile picture: ', suc);

        this.userImageUrl = this.fileService.profilePictureSource(this.currentPlayer.loginName, true);
        const msg: RefreshProfilePics = {
          type: MessageType.REFRESH_COMMAND,
          subType: RefreshCommandType.refreshProfilePic,
        };
        this.gameStateService.sendMessage(MessageType.REFRESH_COMMAND, msg);
      });
    }
  }

  getRole(): string {
    if (this.currentPlayer === undefined || this.currentUser === undefined) {
      return 'undefined';
    } else if (this.currentPlayer.isCurrentHost) {
      return 'Host';
    } else if (this.currentUser.is_dev) {
      return 'Dev';
    } else {
      return 'Player';
    }
  }

  getTimePlayed(): string {
    if (this.currentUser !== undefined) {
      const min = this.currentUser.time_played;
      return `${Math.floor(min / 60)} hours ${Math.floor(min % 60)} minutes`;
    } else {
      return '0 hours 0 minutes';
    }
  }
}
