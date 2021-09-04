import { Component, Input, OnInit } from '@angular/core';
import { BasicUser } from 'src/app/services/user.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['../../../../../../src/assets/css/styles.css', './edit-profile.component.css'],
})
export class EditProfileComponent {
  @Input() currentUser: BasicUser;
}
