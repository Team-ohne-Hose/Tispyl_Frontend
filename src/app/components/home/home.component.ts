import { AfterContentInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtTokenService } from '../../services/jwttoken.service';
import { BasicUser, UserService } from '../../services/user.service';
import { APIResponse } from '../../model/APIResponse';
import { FileService } from 'src/app/services/file.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterContentInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private AuthService: JwtTokenService,
    private userService: UserService,
    private fileService: FileService
  ) {}

  /** Images displayed in the header carousel (expects 16:9 images) */
  protected imageSources: string[] = [
    'assets/carousel/george-cox-l9Z93oauxgs-unsplash.jpg',
    'assets/carousel/kazuend-NmvMhov1sYc-unsplash.jpg',
    'assets/carousel/radovan-46Yad80Ynp4-unsplash.jpg',
    'assets/carousel/radovan-rgJ1xwQsoJc-unsplash.jpg',
    'assets/carousel/wil-stewart-UErWoQEoMrc-unsplash.jpg',
  ];

  /** Carousel auxiliaries */
  private scrollInterval = 5000;
  protected activeSlide = 1;
  protected originalSourceCount: number = this.imageSources.length;
  @ViewChild('banner') banner: ElementRef;

  /** Navbar auxiliaries */
  protected logoSource = 'assets/logo.png';
  @ViewChild('dropdown') dropDown: ElementRef;

  /** State values */
  protected currentUser: BasicUser;
  protected isLoggedIn = false;
  protected profileSource: string;

  // subscriptions
  private activeUser$$: Subscription;

  /**
   * Prepares {@link imageSources} for infinite scrolling by pre- and appending new elements. Example:
   * [1, 2, 3] -> [2, 3,  1, 2, 3,  1, 2]
   * This is done to achieve a faked wrap around effect using complex scroll logic.
   *
   * @note Requires input array.length >= 2. Lower input length have not been implemented as their use case
   * is not needed at the moment.
   */
  private static extendForWrapping<T>(arr: T[]): T[] {
    if (arr.length >= 2) {
      return [arr[arr.length - 2], arr[arr.length - 1]].concat(arr, [arr[0], arr[1]]);
    } else {
      throw new Error('Input array was to small for infinite wrapping extension of the carousel images');
    }
  }

  ngOnInit(): void {
    this.imageSources = HomeComponent.extendForWrapping<string>(this.imageSources);

    /** Check for active JWT Token */
    if (this.AuthService.isLoggedIn()) {
      this.userService.getUserByLoginName(localStorage.getItem('username')).subscribe({
        next: (response: APIResponse<BasicUser>) => {
          this.userService.setActiveUser(response.payload as BasicUser);
        },
        error: (err) => {
          console.error('Found JWT token indicating a logged in user, but could not retrieve BasicUser object from server', err);
        },
      });
    }

    /** Triggers as soon as a user logs in or out */
    this.activeUser$$ = this.userService.activeUser.subscribe((u: BasicUser) => {
      if (u !== undefined) {
        this.currentUser = u;
        this.isLoggedIn = true;
        this.profileSource = this.fileService.profilePictureSource(u.login_name, true);
      } else {
        this.isLoggedIn = false;
        this.profileSource = null;
      }
    });
  }

  ngAfterContentInit(): void {
    /** Align initial slide by scrolling forward once to get into a defined state */
    setTimeout(() => {
      this.nextSlide('right');
    }, 50);

    /** Activate auto scrolling */
    setInterval(() => {
      this.nextSlide('right');
    }, this.scrollInterval);
  }

  ngOnDestroy(): void {
    this.activeUser$$.unsubscribe();
  }

  public navigate(target: string): void {
    this.router.navigate([target], { relativeTo: this.route });
  }

  private scrollToSlide(idx: number, behavior: 'auto' | 'smooth'): void {
    const img_width = this.banner.nativeElement.scrollWidth / this.imageSources.length;
    this.banner.nativeElement.scrollTo({ top: 0, left: (idx - 1) * img_width, behavior: behavior });
  }

  /**
   * Scroll carousel to the next slide while respecting implicit boundaries to appear to wrap around while scrolling
   * @param direction weather to scroll left or right
   */
  public nextSlide(direction: 'left' | 'right'): void {
    const step = direction === 'left' ? -1 : 1;
    const first = 0;
    const last = this.imageSources.length - 1;
    const lowerBoarder = first + 1;
    const upperBoarder = last - 1;

    if (this.activeSlide <= lowerBoarder) {
      this.activeSlide = upperBoarder - 1;
      this.scrollToSlide(this.activeSlide, 'auto');
    } else if (this.activeSlide >= upperBoarder) {
      this.activeSlide = lowerBoarder + 1;
      this.scrollToSlide(this.activeSlide, 'auto');
    }
    this.activeSlide += step;
    this.scrollToSlide(this.activeSlide, 'smooth');
  }

  /** Jumps to a specific slide defined by an anchor tag index */
  public onAnchorClick(idx: number): void {
    this.activeSlide = idx;
    this.scrollToSlide(idx, 'smooth');
  }

  public onLogOut(): void {
    this.AuthService.logout();
    this.navigate('./news');
  }

  /** Dropdown menu close event */
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (this.dropDown !== undefined && !this.dropDown.nativeElement.contains(event.target)) {
      const classes = this.dropDown.nativeElement.classList;
      if (classes.contains('open')) {
        classes.remove('open');
      }
    }
  }

  public onProfileClick(): void {
    const classes = this.dropDown.nativeElement.classList;
    if (classes.contains('open')) {
      classes.remove('open');
    } else {
      classes.add('open');
    }
  }
}
