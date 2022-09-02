import { Component } from '@angular/core';
import { BasicUser, UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
})
export class IntroductionComponent {
  visible = false;

  constructor(userService: UserService) {
    userService.activeUser.subscribe((loginUsr: BasicUser) => {
      if (loginUsr.time_played < 300) {
        this.visible = true;
      }
    });
  }

  hide() {
    this.visible = false;
  }
}
