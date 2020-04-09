import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../model/User';

@Component({
  selector: 'app-profile-display',
  templateUrl: './profile-display.component.html',
  styleUrls: ['./profile-display.component.css']
})
export class ProfileDisplayComponent implements OnInit {

  @Input() user: User;
  @Output() onLogout = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  logout() {
    this.onLogout.emit({})
  }

  onFileChanged(event) {
    const file = event.target.files[0]
    console.log(file)
  }

}
