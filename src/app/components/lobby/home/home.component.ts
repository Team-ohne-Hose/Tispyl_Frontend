import {
  AfterContentInit,
  Component,
  ElementRef, HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginUser } from '../../../model/User';
import { JwtTokenService } from '../../../services/jwttoken.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterContentInit {

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private AuthService: JwtTokenService,
    private userManagement: UserService
  ) {}

  /** Images displayed in the header carousel (expects 16:9 images) */
  imageSources: string[] = [
    'assets/carousel/george-cox-l9Z93oauxgs-unsplash.jpg',
    'assets/carousel/kazuend-NmvMhov1sYc-unsplash.jpg',
    'assets/carousel/radovan-46Yad80Ynp4-unsplash.jpg',
    'assets/carousel/radovan-rgJ1xwQsoJc-unsplash.jpg',
    'assets/carousel/wil-stewart-UErWoQEoMrc-unsplash.jpg'
  ];

  /** Carousel auxiliaries */
  scrollInterval = 5000;
  activeSlide = 1;
  @ViewChild('banner') banner: ElementRef;
  originalSourceCount = this.imageSources.length;

  /** Navbar auxiliaries */
  logoSource = 'assets/logo.png';
  userSource = 'assets/defaultImage.jpg';
  @ViewChild('dropdown') dropDown: ElementRef;
  isLoggedIn = false;

  /** State values */
  activeUser = this.userManagement.getActiveUser();

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
    if (this.AuthService.isLoggedIn) {
      this.userManagement.getUserByLoginName(localStorage.getItem('username')).subscribe(userResponse => {
        this.userManagement.setActiveUser(userResponse.payload as LoginUser);
      });
    } else {
      this.AuthService.logout();
    }

    this.activeUser.subscribe(u => {
      this.isLoggedIn = u !== undefined;
    });
  }

  ngAfterContentInit(): void {
    /** Align initial slide by scrolling forward once to get into a defined state */
    setTimeout(() => { this.nextSlide('right'); }, 50);

    /** Activate auto scrolling */
    setInterval(() => { this.nextSlide('right'); }, this.scrollInterval);
  }

  public navigate(target: string) {
    this.router.navigate([target], { relativeTo: this.route });
  }

  private scrollToSlide(idx: number, behavior: 'auto' | 'smooth'): void {
    const img_width = this.banner.nativeElement.scrollWidth / this.imageSources.length;
    this.banner.nativeElement.scrollTo({ top: 0, left: (idx - 1) * img_width, behavior: behavior});
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

    if (this.activeSlide <= lowerBoarder ) {
      this.activeSlide = upperBoarder - 1;
      this.scrollToSlide(this.activeSlide, 'auto');
    } else if (this.activeSlide >= upperBoarder ) {
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
  }

  /** Dropdown menu close event */
  @HostListener('document:click', ['$event'])
  clickOutside(event) {
    if ( !this.dropDown.nativeElement.contains(event.target) ) {
      const classes = this.dropDown.nativeElement.classList;
      if ( classes.contains('open') ) {
        classes.remove('open');
      }
    }
  }

  public onProfileClick(): void {
    const classes = this.dropDown.nativeElement.classList;
    if ( classes.contains('open') ) {
      classes.remove('open');
    } else {
      classes.add('open');
    }
  }
}