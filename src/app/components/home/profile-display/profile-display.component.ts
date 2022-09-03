import { Component, Input } from '@angular/core';
import { BasicUser, UserService } from '../../../services/user.service';
import { FileService } from '../../../services/file.service';
import { ObjectLoaderService } from '../../../services/object-loader/object-loader.service';
import { JwtTokenService } from 'src/app/services/jwttoken.service';
import { environmentList, figureList } from '../lobby/lobbyLUTs';

@Component({
  selector: 'app-profile-display',
  templateUrl: './profile-display.component.html',
  styleUrls: ['./profile-display.component.css'],
})
export class ProfileDisplayComponent {
  // TODO: set at Backend.
  selectedFigure;
  selectedEnv = 9;

  @Input() user: BasicUser;
  profileSource;

  figureList = figureList;
  envList = environmentList;

  constructor(
    private userManagement: UserService,
    private fileManagement: FileService,
    private objectLoaderService: ObjectLoaderService,
    private AuthService: JwtTokenService
  ) {
    this.userManagement.activeUser.subscribe((u) => {
      if (u !== undefined) {
        this.profileSource = this.fileManagement.profilePictureSource(u.login_name, true);
      }
    });
  }

  getDate(): Date {
    return new Date(this.user.user_creation);
  }

  getTimePlayed(): string {
    const min = this.user.time_played;
    return `${Math.floor(min / 60)} hours ${Math.floor(min % 60)} minutes`;
  }

  logout(): void {
    console.log('logout');
    this.AuthService.logout();
    this.userManagement.setActiveUser(undefined);
  }

  onFileChanged(event): void {
    const file = event.target.files[0];
    this.fileManagement.uploadProfilePicture(file, this.user).subscribe(() => {
      this.userManagement.syncUserData(this.user);
    });
  }

  setGameSettings(): void {
    this.objectLoaderService.setCurrentCubeMap(this.selectedEnv);
  }
}
