import { Component } from '@angular/core';
import { LoginUser, UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
})
export class IntroductionComponent {
  visible = false;

  constructor(userService: UserService) {
    userService.activeUser.subscribe((loginUsr: LoginUser) => {
      if (loginUsr.time_played < 300) {
        this.visible = true;
      }
    });
  }

  hide() {
    this.visible = false;
  }
}
