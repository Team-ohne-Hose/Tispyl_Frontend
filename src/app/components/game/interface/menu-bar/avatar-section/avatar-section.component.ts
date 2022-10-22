import { Component } from '@angular/core';
import { Observable, combineLatest, filter, map, share } from 'rxjs';
import { FileService } from 'src/app/services/file.service';
import { GameStateService } from 'src/app/services/game-state.service';
import { BasicUser, UserService } from 'src/app/services/user.service';

export enum TitleRole {
  'HOST' = 'Host',
  'DEV' = 'Dev',
  'PLAYER' = 'Player',
}
@Component({
  selector: 'app-menu-avatar',
  templateUrl: './avatar-section.component.html',
  styleUrls: ['./avatar-section.component.css'],
})
export class AvatarSectionComponent {
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
            return TitleRole.HOST;
          } else if (value.currentUser.is_dev) {
            return TitleRole.DEV;
          } else {
            return TitleRole.PLAYER;
          }
        })
      )
      .pipe(share());
  }
}
