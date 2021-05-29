import { Component, Input, OnInit } from '@angular/core';
import { FileService } from 'src/app/services/file.service';
import { LoginUser, User, UserService } from 'src/app/services/user.service';

class ImageSnippet {
  pending = false;
  status = 'init';

  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  timePlayed: string;
  currentUser: User;
  profileSource: string;
  selectedFile: ImageSnippet;

  constructor(private userService: UserService, private fileService: FileService) {}

  private onSuccess() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'ok';
  }

  private onError() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'fail';
    this.selectedFile.src = '';
  }

  ngOnInit(): void {
    this.userService.activeUser.subscribe((user: User) => {
      if (user !== undefined) {
        this.currentUser = user;
        this.profileSource = this.fileService.profilePictureSource(user.login_name, true);

        const min = user.time_played;
        this.timePlayed = `${Math.floor(min / 60)} hours ${Math.floor(min % 60)} minutes`;
      }
    });
  }

  processFile(imageInput: DataTransfer) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: ProgressEvent<FileReader>) => {
      this.selectedFile = new ImageSnippet(event.target.result as string, file);

      this.fileService.uploadProfilePicture(this.selectedFile.file, this.currentUser).subscribe(
        (user: LoginUser) => {
          console.log(user);
          this.userService.setActiveUser(user);
          this.profileSource = this.fileService.profilePictureSource(this.currentUser.login_name, true);
          this.onSuccess();
        },
        (err) => {
          this.onError();
        }
      );
    });
    reader.readAsDataURL(file);
  }
}
