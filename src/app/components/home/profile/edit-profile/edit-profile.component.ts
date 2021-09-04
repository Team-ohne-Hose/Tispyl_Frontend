import { Component, Input, OnInit } from '@angular/core';
import * as hash from 'object-hash';
import { BasicUser, UserService } from 'src/app/services/user.service';
import { AppToastService } from 'src/app/services/toast.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EqualityValidator } from '../../login/EqualityValidator';

export class EditUserData {
  id: number;
  login_name?: string;
  display_name: string;
  currentPassword: string;
  newPassword?: string;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
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
  edit: FormGroup;

  onSubmit(): void {
    const editUser: EditUserData = new EditUserData();
    editUser.id = this.currentUser.id;
    editUser.currentPassword = hash.MD5(this.edit.value.currentPassword);
    editUser.display_name = this.edit.value.newUsername;

    if (this.edit.value.newPassword !== '') {
      editUser.newPassword = hash.MD5(this.edit.value.newPassword);
    }

    this.userService.updateUser(editUser);

    // reset form fields
    this.edit.value.currentPassword = '';
    this.edit.value.newPassword = '';
    this.edit.value.newPasswordConfirmed = '';
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
}
