import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../../model/User';
import {UserService} from '../../services/user.service';
import {FileService} from '../../services/file.service';
import {PlayerModel} from '../../model/WsData';
import {ObjectLoaderService} from '../../services/object-loader.service';

enum Resolution {
  res_8k,
  res_4k,
  res_2k,
  res_1k
}
@Component({
  selector: 'app-profile-display',
  templateUrl: './profile-display.component.html',
  styleUrls: ['./profile-display.component.css']
})
export class ProfileDisplayComponent {
  Resolution = Resolution;

  // TODO: set at Backend.
  selectedFigure;
  selectedEnv;

  @Input() user: User;
  profileSource;

  figureList = [{name: 'Nuka Cola', value: PlayerModel.bcap_NukaCola},
    {name: 'Coca Cola', value: PlayerModel.bcap_CocaCola},
    {name: 'Developer', value: PlayerModel.bcap_Developer},
    {name: 'Jägermeister', value: PlayerModel.bcap_Jagermeister},
    {name: 'Murica', value: PlayerModel.bcap_Murica},
    {name: 'Hofbräu', value: PlayerModel.bcap_hb},
    {name: 'Soviet', value: PlayerModel.bcap_OurAnthem},
    {name: 'Schmucker', value: PlayerModel.bcap_Schmucker},
    {name: 'Anime', value: PlayerModel.bcap_Tiddies1},
    {name: 'Cat', value: PlayerModel.bcap_cat},
    {name: 'Yoshi', value: PlayerModel.bcap_yoshi}
    ];
  envList = [{name: 'Ryfjallet (4k)', resolution: Resolution.res_4k, value: 0},
    {name: 'Maskonaive1 (4k)', resolution: Resolution.res_4k, value: 1},
    {name: 'Maskonaive2 (4k)', resolution: Resolution.res_4k, value: 2},
    {name: 'Maskonaive3 (4k)', resolution: Resolution.res_4k, value: 3},
    {name: 'Nalovardo (4k)', resolution: Resolution.res_4k, value: 4},
    {name: 'Teide (4k)', resolution: Resolution.res_4k, value: 5},
    {name: 'undefined', resolution: Resolution.res_4k, value: 6},
    {name: 'undefined2', resolution: Resolution.res_4k, value: 7}, ];

  constructor(private userManagement: UserService, private fileManagement: FileService, private objectLoaderService: ObjectLoaderService) {
    this.userManagement.getActiveUser().subscribe( u => {
      console.log('USER CHANGED TO: ', u);
      if ( u !== undefined ) {
        this.profileSource = this.fileManagement.profilePictureSource(u.login_name)
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
    this.fileManagement.removeProfilePicture(this.user).subscribe( suc => {
      console.log(suc);
      this.userManagement.syncUserData(this.user);
    });
  }

  setGameSettings() {
    console.log('setting the cubemap to', this.selectedEnv);
    this.objectLoaderService.setCurrentCubeMap(this.selectedEnv);
  }

}
