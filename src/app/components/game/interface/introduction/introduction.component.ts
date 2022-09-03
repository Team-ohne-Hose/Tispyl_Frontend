import { Component, OnInit } from '@angular/core';
import { skipWhile, take } from 'rxjs/operators';
import { BasicUser, UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css'],
})
export class IntroductionComponent implements OnInit {
  visible = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.activeUser
      .pipe(skipWhile((user: BasicUser) => user === undefined))
      .pipe(take(1))
      .subscribe(
        ((user: BasicUser) => {
          if (user.time_played < 300) {
            this.visible = true;
          }
        }).bind(this)
      );
  }

  hide() {
    this.visible = false;
  }
}
