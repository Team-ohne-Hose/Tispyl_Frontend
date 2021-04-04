import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { User } from '../../../model/User';
import { UserService } from '../../../services/user.service';
import { FileService } from '../../../services/file.service';
import { PlayerModel } from '../../../model/WsData';
import { ObjectLoaderService } from '../../../services/object-loader.service';
import { JwtTokenService } from 'src/app/services/jwttoken.service';
import { figureList, environmentList } from '../lobbyLUTs';


@Component({
  selector: 'app-profile-display',
  templateUrl: './profile-display.component.html',
  styleUrls: ['./profile-display.component.css']
})
export class ProfileDisplayComponent {
  // TODO: set at Backend.
  selectedFigure;
  selectedEnv = 9;

  @Input() user: User;
  profileSource;

  figureList = figureList;
  envList = environmentList;

  constructor(private userManagement: UserService,
              private fileManagement: FileService,
              private objectLoaderService: ObjectLoaderService,
              private AuthService: JwtTokenService) {


    this.userManagement.getActiveUser().subscribe(u => {
      if (u !== undefined) {
        this.profileSource = this.fileManagement.profilePictureSource(u.login_name, true);
      }
    });
  }

  getDate() {
    return new Date(this.user.user_creation);
  }

  getTimePlayed() {
    const min = this.user.time_played;
    return `${Math.floor(min / 60)} hours ${Math.floor(min % 60)} minutes`;
  }

  logout() {
    this.AuthService.logout();
    this.userManagement.setActiveUser(undefined);
  }

  onFileChanged(event) {
    const file = event.target.files[0];
    this.fileManagement.uploadProfilePicture(file, this.user).subscribe(suc => {
      console.log(suc);
      this.userManagement.syncUserData(this.user);
    });
  }

  removeProfilePic(event) {
    this.fileManagement.removeProfilePicture(this.user).subscribe(suc => {
      console.log(suc);
      this.userManagement.syncUserData(this.user);
    });
  }

  setGameSettings() {
    this.objectLoaderService.setCurrentCubeMap(this.selectedEnv);
  }

}
