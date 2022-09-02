import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { BasicUser, UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
})
export class IntroductionComponent {
  visible = false;

  // subscriptions
  private activeUser$$: Subscription;

  constructor(userService: UserService) {
    this.activeUser$$ = userService.activeUser.subscribe((loginUsr: BasicUser) => {
      if (loginUsr.time_played < 300) {
        this.visible = true;
      }
      this.activeUser$$.unsubscribe();
    });
  }

  hide() {
    this.visible = false;
  }
}
