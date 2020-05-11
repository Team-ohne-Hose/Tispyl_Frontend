import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../../model/User';
import {UserService} from '../../services/user.service';
import {FileService} from '../../services/file.service';

@Component({
  selector: 'app-profile-display',
  templateUrl: './profile-display.component.html',
  styleUrls: ['./profile-display.component.css']
})
export class ProfileDisplayComponent {

  @Input() user: User;
  profileSource;

  constructor(private userManagement: UserService, private fileManagement: FileService) {
    this.userManagement.getActiveUser().subscribe( u => {
      console.log('USER CHANGED TO: ', u);
      if ( u !== undefined ) {
        this.profileSource = this.fileManagement.profilePictureSource(u)
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
      console.log(suc)
      this.userManagement.syncUserData(this.user)
    })
  }

  removeProfilePic(event) {
    this.fileManagement.removeProfilePicture(this.user).subscribe( suc => {
      console.log(suc)
      this.userManagement.syncUserData(this.user)
    })
  }

}
