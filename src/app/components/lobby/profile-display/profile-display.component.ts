import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { User } from '../../../model/User';
import { UserService } from '../../../services/user.service';
import { FileService } from '../../../services/file.service';
import { PlayerModel } from '../../../model/WsData';
import { ObjectLoaderService } from '../../../services/object-loader.service';
import { JwtTokenService } from 'src/app/services/jwttoken.service';

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
  envList = [{name: 'Ryfjallet (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/mountain-ryfjallet.jpg', value: 0},
    {name: 'Maskonaive1 (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/mountain-maskonaive.jpg', value: 1},
    {name: 'Maskonaive2 (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/mountain-maskonaive2.jpg', value: 2},
    {name: 'Maskonaive3 (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/mountain-maskonaive3.jpg', value: 3},
    {name: 'Nalovardo (1k)', resolution: Resolution.res_1k, thumb: '/cubemaps/thumbs/mountain-nalovardo.jpg', value: 4},
    {name: 'Teide (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/mountain-teide.jpg', value: 5},
    {name: 'ForbiddenCity (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/urban-forbiddenCity.jpg', value: 6},
    {name: 'GamlaStan (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/urban-gamlaStan.jpg', value: 7},
    {name: 'Medborgarplatsen (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/urban-medborgarplatsen.jpg', value: 8},
    {name: 'Roundabout (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/urban-roundabout.jpg', value: 9},
    {name: 'SaintLazarusChurch (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/urban-stLazarus.jpg', value: 10},
    {name: 'SaintLazarusChurch2 (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/urban-stLazarus2.jpg', value: 11},
    {name: 'SaintLazarusChurch3 (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/urban-stLazarus3.jpg', value: 12},
    {name: 'UnionSquare (1k)', resolution: Resolution.res_1k, thumb: '/cubemaps/thumbs/urban-unionSquare.jpg', value: 13},
    {name: 'Bridge (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/bridge-bridge.jpg', value: 14},
    {name: 'Bridge2 (2k)', resolution: Resolution.res_2k, thumb: '/cubemaps/thumbs/bridge-bridge2.jpg', value: 15}];

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
