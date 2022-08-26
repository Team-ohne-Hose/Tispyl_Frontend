import { Component, Input, OnInit } from '@angular/core';
import { MD5 } from 'object-hash';
import { BasicUser, UserService } from 'src/app/services/user.service';
import { AppToastService } from 'src/app/services/toast.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  @Input() toggleShow: () => {};

  /** input values */
  username = '';
  currentPassword = '';
  newPassword = '';
  newPasswordConfirmed = '';

  // edit form
  edit: UntypedFormGroup;

  onSubmit(): void {
    const editUser: EditUserData = new EditUserData();
    editUser.id = this.currentUser.id;
    editUser.currentPassword = MD5(this.edit.value.currentPassword);
    editUser.display_name = this.edit.value.newUsername;

    if (this.edit.value.newPassword !== '') {
      editUser.newPassword = MD5(this.edit.value.newPassword);
    }

    this.userService.updateUser(editUser);

    // reset form fields
    this.edit.value.currentPassword = '';
    this.edit.value.newPassword = '';
    this.edit.value.newPasswordConfirmed = '';
    this.toggleShow();
  }

  ngOnInit(): void {
    this.edit = new UntypedFormGroup(
      {
        newUsername: new UntypedFormControl(this.currentUser.display_name, [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(48),
        ]),
        currentPassword: new UntypedFormControl('', [Validators.minLength(8), Validators.required]),
        newPassword: new UntypedFormControl('', [Validators.minLength(8), Validators.maxLength(64)]),
        newPasswordConfirmed: new UntypedFormControl('', [Validators.minLength(8), Validators.maxLength(64)]),
      },
      [EqualityValidator('newPassword', 'newPasswordConfirmed')]
    );
  }
}
