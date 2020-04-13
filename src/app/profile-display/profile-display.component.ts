import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../model/User';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-profile-display',
  templateUrl: './profile-display.component.html',
  styleUrls: ['./profile-display.component.css']
})
export class ProfileDisplayComponent implements OnInit {

  @Input() user: User;

  constructor(private userManagement: UserService) { }

  ngOnInit(): void {
  }

  logout() {
    this.userManagement.setActiveUser(undefined);
    this.userManagement.getActiveUser().subscribe( u => console.log('LOGGED OUT, USER NOW:', u));
  }

  onFileChanged(event) {
    const file = event.target.files[0]
    console.log(file)
  }

}
