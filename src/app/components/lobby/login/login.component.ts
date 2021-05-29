import { Component, Input, OnInit } from '@angular/core';
import { TextContainer } from '../../../model/TextContainer';
import * as hash from 'object-hash';
import { UserService, LoginUser } from '../../../services/user.service';
import { JwtTokenService } from 'src/app/services/jwttoken.service';
import { TranslationService } from '../../../services/translation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterOptions } from '../../../model/RegisterOptions';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EqualityValidator } from './EqualityValidator';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  @Input() languageObjects: TextContainer = TranslationService.getTranslations('en').text;

  /** Login input values */
  login_name = '';
  password_plain = '';

  /** Login auxiliaries */
  infoMessage = '';
  outdatedErrors = false;
  targetRoute = '../news';
  isRequesting = false;

  /** Registration form */
  registration = new FormGroup(
    {
      new_login_name: new FormControl('', Validators.required),
      new_display_name: new FormControl('', Validators.required),
      new_password_plain0: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(64),
      ]),
      new_password_plain1: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(64),
      ]),
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
      this.router.navigate([this.targetRoute], { relativeTo: this.route });
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
    this.jwtTokenService.login(this.login_name, hash.MD5(this.password_plain)).subscribe(
      (usr: LoginUser) => {
        this.isRequesting = false;
        console.debug('Logged in as: ', usr);
        this.router.navigate([this.targetRoute], { relativeTo: this.route });
      },
      (err) => {
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
      }
    );
  }

  /** Event listener set on all input fields to react on key strokes */
  keyPressed(keyEvent): void {
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

      this.jwtTokenService.register(formData).subscribe(
        () => {
          this.isRequesting = false;
          this.registration.reset();
          this.isSuccessText = true;
          this.infoMessage = 'Awesome! Your account was successfully created.';
          setTimeout(() => {
            this.switch();
          }, 1500);
        },
        (err) => {
          this.isRequesting = false;
          switch (err.status) {
            case 0: {
              this.setInfoText('Failed to reach the server due to unknown reasons.', hadError);
              break;
            }
            case 400: {
              this.setInfoText(err, hadError);
              break;
            }
            default: {
              console.error('Failed to register user: ', err);
              this.setInfoText('Unknown error.', hadError);
            }
          }
        }
      );
    }
  }
}
