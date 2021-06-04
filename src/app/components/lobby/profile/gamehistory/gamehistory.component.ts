import { Component, Input } from '@angular/core';
import { User } from 'src/app/services/user.service';

@Component({
  selector: 'app-gamehistory',
  templateUrl: './gamehistory.component.html',
  styleUrls: ['../profile.component.css'],
})
export class GameHistoryComponent {
  @Input() currentUser: User;

  randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
