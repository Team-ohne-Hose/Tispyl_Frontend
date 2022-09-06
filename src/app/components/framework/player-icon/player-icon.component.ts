import { Component, Input } from '@angular/core';
import { FileService } from '../../../services/file.service';
import { GameStateService } from '../../../services/game-state.service';
import { MessageType, RefreshCommandType, RefreshProfilePics } from '../../../model/WsData';
import { UserService } from '../../../services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-player-icon',
  templateUrl: './player-icon.component.html',
  styleUrls: ['./player-icon.component.css'],
})
export class PlayerIconComponent {
  @Input()
  size = '100px';

  @Input()
  borderThickness = '10px';

  currentSource = '../../assets/defaultImage.jpg';

  @Input()
  loginName$: Observable<string> = undefined;

  @Input()
  loginName: string = undefined;

  @Input()
  enableUpload = false;

  private loginNameCached;

  constructor(private fileService: FileService, private gameState: GameStateService, private userService: UserService) {}

  uploadImageFile(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target?.files[0];
    if (this.loginNameCached !== undefined && file !== undefined) {
      const sub = this.fileService.uploadProfilePicture(file, this.userService.activeUser.getValue()).subscribe(() => {
        this.currentSource = this.fileService.profilePictureSource(this.loginNameCached, true);
        const msg: RefreshProfilePics = {
          type: MessageType.REFRESH_COMMAND,
          subType: RefreshCommandType.refreshProfilePic,
        };
        this.gameState.sendMessage(MessageType.REFRESH_COMMAND, msg);
        sub.unsubscribe();
      });
    }
  }

  ngOnInit(): void {
    if (this.loginName$ !== undefined) {
      this.loginName$.subscribe((loginName: string) => {
        //this.currentSource = this.fileService.profilePictureSource(loginName);
        this.loginNameCached = loginName;
      });
    } else {
      //this.currentSource = this.fileService.profilePictureSource(this.loginName);
      this.loginNameCached = this.loginName;
    }
  }
}
