import { Component, Input, OnInit } from '@angular/core';
import * as hash from 'object-hash';
import { BasicUser, UserService } from 'src/app/services/user.service';
import { AppToastService } from 'src/app/services/toast.service';

export class EditUserData {
  id: number;
  login_name?: string;
  display_name?: string;
  currentPassword: string;
  newPassword?: string;
  newPasswordConfirmed?: string;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['../../../../../../src/assets/css/styles.css', './edit-profile.component.css'],
})
export class EditProfileComponent {
  @Input() currentUser: BasicUser;

  constructor(private userService: UserService, private toastService: AppToastService) {}

  submitUserChanges(changedUser: EditUserData) {
    changedUser.id = this.currentUser.id;

    if (changedUser.currentPassword.length === 0)
      this.toastService.show('Error', 'Du hast kein Passwort angegeben.', 'bg-danger text-light', 3000);
    else if (
      (changedUser.newPassword.length !== 0 && changedUser.newPasswordConfirmed.length === 0) ||
      (changedUser.newPassword.length === 0 && changedUser.newPasswordConfirmed.length !== 0)
    )
      this.toastService.show('Error', 'Bitte wiederhole dein neues Passwort.', 'bg-danger text-light', 3000);
    else if (changedUser.newPassword !== changedUser.newPasswordConfirmed)
      this.toastService.show(
        'Error',
        'Die eingegebenen Passwörter stimmen nicht überein.',
        'bg-danger text-light',
        3000
      );
    else {
      // hash passwords
      changedUser.newPassword = hash.MD5(changedUser.newPassword);
      changedUser.currentPassword = hash.MD5(changedUser.currentPassword);

      delete changedUser.newPasswordConfirmed;

      this.userService.updateUser(changedUser);
    }
  }
}
