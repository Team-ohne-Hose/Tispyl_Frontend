import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { skipWhile, take } from 'rxjs/operators';
import { BasicUser, UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
})
export class IntroductionComponent implements OnInit, OnDestroy {
  visible: boolean;

  // subscriptions
  private activeUser$$: Subscription;

  constructor(private userService: UserService) {
    this.visible = false;
  }

  ngOnInit(): void {
    this.activeUser$$ = this.userService.activeUser
      .pipe(skipWhile((user: BasicUser) => user === undefined))
      .pipe(take(1))
      .subscribe(
        ((user: BasicUser) => {
          if (user.time_played < 300) this.visible = true;
        }).bind(this)
      );
  }

  ngOnDestroy(): void {
    this.activeUser$$.unsubscribe();
  }

  hide() {
    this.visible = false;
  }
}
