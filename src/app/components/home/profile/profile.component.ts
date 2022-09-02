import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FileService } from 'src/app/services/file.service';
import { BasicUser, UserService } from 'src/app/services/user.service';

class ImageSnippet {
  pending = false;
  status = 'init';

  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  timePlayed: string;
  currentUser: BasicUser;
  profileSource: string;
  selectedFile: ImageSnippet;
  isCurrentUser: boolean;
  foreignUser: BasicUser;

  isShownLastGames = true;

  toggleShow = (): void => {
    this.isShownLastGames = !this.isShownLastGames;
  };

  constructor(
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private userService: UserService,
    private fileService: FileService
  ) {}

  private onSuccess(): void {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'ok';
  }

  private onError(): void {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'fail';
    this.selectedFile.src = '';
  }

  ngOnInit(): void {
    const routeParams: ParamMap = this.route.snapshot.paramMap;
    const userId = Number(routeParams.get('userId'));

    // get foreign user
    this.userService.requestUserDatabyId(userId).subscribe((response) => {
      this.foreignUser = response.payload as BasicUser;
      this.isCurrentUser = this.foreignUser.login_name === this.currentUser.login_name;
      this.profileSource = this.fileService.profilePictureSource(this.foreignUser.login_name, true);
      this.changeDetector.markForCheck();
    });

    this.userService.activeUser.subscribe((user: BasicUser) => {
      if (user !== undefined) {
        this.currentUser = user;
        this.profileSource = this.fileService.profilePictureSource(user.login_name, true);

        const min = user.time_played;
        this.timePlayed = `${Math.floor(min / 60)} hours ${Math.floor(min % 60)} minutes`;
      }
      this.changeDetector.markForCheck();
    });
  }

  processFile(imageInput: HTMLInputElement): void {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: ProgressEvent<FileReader>) => {
      this.selectedFile = new ImageSnippet(event.target.result as string, file);

      this.fileService.uploadProfilePicture(this.selectedFile.file, this.currentUser).subscribe(
        (user: BasicUser) => {
          this.userService.setActiveUser(user);
          this.profileSource = this.fileService.profilePictureSource(this.currentUser.login_name, true);
          this.onSuccess();
          this.changeDetector.detectChanges();
        },
        () => {
          this.onError();
        }
      );
    });
    reader.readAsDataURL(file);
  }
}
