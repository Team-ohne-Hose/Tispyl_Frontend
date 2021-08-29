import { Component, Input, OnInit } from '@angular/core';
import * as hash from 'object-hash';
import { BasicUser, UserService } from 'src/app/services/user.service';
import { AppToastService } from 'src/app/services/toast.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EqualityValidator } from '../../login/EqualityValidator';

export class EditUserData {
  id: any;
  login_name?: string;
  display_name: string;
  currentPassword: string;
  newPassword?: string;
  newPasswordConfirmed?: string;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['../../../../../../src/assets/css/styles.css', './edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  constructor(private userService: UserService, private toastService: AppToastService) {}

  @Input() currentUser: BasicUser;

  /** input values */
  username = '';
  currentPassword = '';
  newPassword = '';
  newPasswordConfirmed = '';

  submitted = false;

  /** Registration auxiliaries */
  isSuccessText = false;

  // edit form
  edit = null;

  onSubmit() {
    const editUser: EditUserData = new EditUserData();
    editUser.id = this.currentUser.id;
    editUser.currentPassword = hash.MD5(this.edit.value.currentPassword);
    editUser.display_name = this.edit.value.newUsername;
    this.userService.updateUser(editUser);
  }

  ngOnInit(): void {
    this.edit = new FormGroup(
      {
        newUsername: new FormControl(this.currentUser.display_name, [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(48),
        ]),
        currentPassword: new FormControl('', [Validators.minLength(8), Validators.required]),
        newPassword: new FormControl('', [Validators.minLength(8), Validators.maxLength(64)]),
        newPasswordConfirmed: new FormControl('', [Validators.minLength(8), Validators.maxLength(64)]),
      },
      [EqualityValidator('newPassword', 'newPasswordConfirmed')]
    );
  }

  keyPressed(keyEvent: KeyboardEvent): void {
    console.log(this.edit);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  submitUserChanges(changedUser: EditUserData) {
    changedUser.id = this.currentUser.id;

    if (changedUser.currentPassword.length === 0) {
      this.toastService.show('Error', 'Du hast kein Passwort angegeben.', 'bg-danger text-light', 3000);
    } else if (
      (changedUser.newPassword.length !== 0 && changedUser.newPasswordConfirmed.length === 0) ||
      (changedUser.newPassword.length === 0 && changedUser.newPasswordConfirmed.length !== 0)
    ) {
      this.toastService.show('Error', 'Bitte wiederhole dein neues Passwort.', 'bg-danger text-light', 3000);
    } else if (changedUser.newPassword !== changedUser.newPasswordConfirmed) {
      this.toastService.show(
        'Error',
        'Die eingegebenen Passwörter stimmen nicht überein.',
        'bg-danger text-light',
        3000
      );
    } else {
      // hash passwords
      changedUser.newPassword = hash.MD5(changedUser.newPassword);
      changedUser.currentPassword = hash.MD5(changedUser.currentPassword);

      delete changedUser.newPasswordConfirmed;

      this.userService.updateUser(changedUser);
    }
  }
}
