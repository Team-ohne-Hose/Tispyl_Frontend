import { Component, OnInit } from '@angular/core';
import { MD5 } from 'object-hash';
import { BasicUser, UserService } from '../../../services/user.service';
import { JwtTokenService } from 'src/app/services/jwttoken.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterOptions } from '../../../model/RegisterOptions';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EqualityValidator } from './EqualityValidator';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  /** Login input values */
  login_name = '';
  password_plain = '';

  /** Login auxiliaries */
  infoMessage = '';
  outdatedErrors = false;
  targetRoute = '../news';
  isRequesting = false;

  /** Registration form */
  registration = new UntypedFormGroup(
    {
      new_login_name: new UntypedFormControl('', Validators.required),
      new_display_name: new UntypedFormControl('', Validators.required),
      new_password_plain0: new UntypedFormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(64)]),
      new_password_plain1: new UntypedFormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(64)]),
    },
    EqualityValidator('new_password_plain0', 'new_password_plain1')
  );

  /** Registration auxiliaries */
  isSuccessText = false;

  /** General values */
  swapContent = false;
  swapLayout = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private userManagement: UserService,
    private jwtTokenService: JwtTokenService
  ) {}

  ngOnInit(): void {
    /** Redirect to targetRoute if already logged in */
    if (this.jwtTokenService.isLoggedIn()) {
      this.router
        .navigate([this.targetRoute], { relativeTo: this.route })
        .catch((reason) =>
          console.warn(`Failed to navigate to [${this.targetRoute}] even though the user is logged in. Reason: ${reason}`)
        );
    } else {
      this.jwtTokenService.logout();
    }
  }

  /** Basic layout switching with a 90% good looking animation */
  switch(): void {
    this.resetInfoText();
    this.swapLayout = !this.swapLayout;
    setTimeout(() => {
      this.swapContent = !this.swapContent;
    }, 300);
  }

  private resetInfoText(): void {
    this.outdatedErrors = false;
    this.infoMessage = '';
  }

  private setInfoText(text: string, delay: boolean): void {
    setTimeout(
      () => {
        this.infoMessage = text;
      },
      delay ? 500 : 0
    );
  }

  /** Login function that respects error handling and user feedback */
  onLogin(): void {
    const hadError = this.infoMessage.length > 0;
    this.isRequesting = true;
    this.resetInfoText();

    // remove old token from webstorage
    if (!this.jwtTokenService.isLoggedIn()) {
      this.jwtTokenService.logout();
    }

    this.jwtTokenService.login(this.login_name, MD5(this.password_plain)).subscribe({
      next: (usr: BasicUser) => {
        this.isRequesting = false;
        console.debug('Logged in as: ', usr);
        this.router
          .navigate([this.targetRoute], { relativeTo: this.route })
          .catch((reason) => console.warn(`Failed to navigate to [${this.targetRoute}] after login. Reason: ${reason}`));
      },
      error: (err) => {
        this.isRequesting = false;
        switch (err.status) {
          case 0: {
            this.setInfoText('Failed to reach the server due to unknown reasons.', hadError);
            break;
          }
          case 400: {
            this.setInfoText('Your PC sent our PC something it didnt understand :/', hadError);
            break;
          }
          case 404: {
            this.setInfoText('User name and Password did not match.', hadError);
            break;
          }
          default: {
            console.error('Failed to log in: ', err);
            this.setInfoText('Unknown error.', hadError);
          }
        }
      },
    });
  }

  /** Event listener set on all input fields to react on key strokes */
  keyPressed(keyEvent: KeyboardEvent): void {
    if (this.isSuccessText) {
      this.isSuccessText = false;
      this.resetInfoText();
    }
    if (this.infoMessage.length > 0) {
      this.outdatedErrors = true;
    }
    if (keyEvent.key === 'Enter') {
      this.onLogin();
    }
  }

  /**
   * Submits the form to the jwtTokenService. Using the native submit mechanisms
   * of Html5 is omitted as registration is done by a service.
   */
  registerUser(): void {
    if (this.registration.valid) {
      const formData: RegisterOptions = {
        username: this.registration.value['new_login_name'],
        displayname: this.registration.value['new_display_name'],
        password: this.registration.value['new_password_plain0'],
      } as RegisterOptions;

      const hadError = this.infoMessage.length > 0;
      this.isRequesting = true;
      this.resetInfoText();

      this.jwtTokenService.register(formData).subscribe({
        next: () => {
          this.isRequesting = false;
          this.registration.reset();
          this.isSuccessText = true;
          this.infoMessage = 'Awesome! Your account was successfully created.';
          setTimeout(() => {
            this.switch();
          }, 1500);
        },
        error: (err) => {
          this.isRequesting = false;
          switch (err.status) {
            case 0: {
              this.setInfoText('Failed to reach the server due to unknown reasons.', hadError);
              break;
            }
            case 400: {
              this.setInfoText(err.error.errors.join('\n'), hadError);
              break;
            }
            default: {
              console.error('Failed to register user: ', err);
              this.setInfoText('Unknown error.', hadError);
            }
          }
        },
      });
    }
  }
}
