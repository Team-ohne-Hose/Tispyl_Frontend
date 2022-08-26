import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';

export enum popoverDirection {
  ABOVE,
  LEFT,
  RIGHT,
  BELOW,
}

export enum popoverSpawn {
  TOP_LEFT,
  TOP_CENTER,
  TOP_RIGHT,
  CENTER_LEFT,
  CENTER_CENTER,
  CENTER_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_CENTER,
  BOTTOM_RIGHT,
}

export enum popoverDisplacement {
  AFTER,
  NONE,
  BEFORE,
}

export interface PopOverOpts {
  /** Selects the direction the box is 'popped out' towards */
  direction?: popoverDirection;

  /**
   * Selects the point to which the pop over element is spawned out from.
   * The spawnPoints attachment points are available:
   *  (TOP_LEFT)---------(TOP_CENTER)--------(TOP_RIGHT)
   *   |                      |                       |
   *  (CENTER_LEFT)----(CENTER_CENTER)----(CENTER_RIGHT)
   *   |                      |                       |
   *  (BOTTOM_LEFT)----(BOTTOM_CENTER)----(BOTTOM_RIGHT)
   */
  spawnPoint?: popoverSpawn;

  /**
   * Selects the positioning of the popover element it self in reference to the spawnPoint.
   * Moving it away from the center position it defaults to. Assuming the top left corner of a box to be before the bottom right corner
   * in both X and Y, BEFORE will move the popover towards the top/left corner and AFTER away from the top/left corner.
   *
   * The following example illustrates:
   * { direction: LEFT, spawnPoint: CENTER_LEFT, displacement: AFTER }
   *
   *                          (TOP_LEFT)-----------
   *                          |
   *     ----------(AFTER) -> (CENTER_LEFT) Anchor
   *                     |    |
   *      Pop over  (NONE)    (BOTTOM_LEFT)--------
   *                     |
   *     ---------(BEFORE)
   */
  displacement?: popoverDisplacement;
}

@Component({
  selector: 'app-custom-popover',
  templateUrl: './custom-popover.component.html',
  styleUrls: ['./custom-popover-internal.component.css', './custom-popover-style.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomPopoverComponent implements OnInit {
  /** (Optional) The provided HTMLElement's CSS property 'position' is set to 'relative' if it is not
   *  already set to either 'relative' of 'absolute' */
  @Input() forcedAnchor: HTMLElement;

  /** (Optional) Sets the positioning of the popover box in relation to its parent */
  @Input() options: PopOverOpts;

  /** (Optional) Weather to show (true) or hide (false) the decorator caret */
  @Input() showCaret = true;

  /** (Optional) Custom style class applied to the host. This should be chosen from one of the
   *  classes defined in the 'custom-popover-style.component.css' file. If a desired style is not available,
   *  it should also be created there. */
  @Input() customClass = '';

  @HostBinding('className')
  private get hostClass(): string {
    return this._hostClass;
  }

  /** Class values for internal use */
  _boxClass = 'popover-box';
  _contentClass = 'popover-content';
  _caretClass = 'popover-caret';
  _hostClass;
  _defaultOptions = {
    direction: popoverDirection.ABOVE,
    displacement: popoverDisplacement.NONE,
    spawnPoint: popoverSpawn.TOP_CENTER,
  };

  ngOnInit(): void {
    this.forceAnchorStyle();
    const opts: PopOverOpts = this.options !== undefined ? this.options : this._defaultOptions;
    this.selectCaret(opts);
    this._hostClass = this.buildHostClass(opts);
  }

  private forceAnchorStyle() {
    if (this.forcedAnchor !== undefined) {
      const oldStyle = this.forcedAnchor.style.position;
      if (oldStyle === 'sticky' || oldStyle === 'fixed') {
        console.warn('A sticky or fixed parent is changed by a custom-popover component. This will most likely cause style issues.');
      }
      if (!(oldStyle === 'relative' || oldStyle === 'absolute')) {
        this.forcedAnchor.style.position = 'relative';
      }
    }
  }

  private selectCaret(opts: PopOverOpts) {
    switch (opts.direction) {
      case popoverDirection.BELOW:
        this._boxClass += ' caret-pos-t';
        switch (opts.displacement) {
          case popoverDisplacement.AFTER:
            this._caretClass += ' clip-bl';
            break;
          case popoverDisplacement.NONE:
            this._caretClass += ' clip-bc';
            break;
          case popoverDisplacement.BEFORE:
            this._caretClass += ' clip-br';
            break;
          default:
            this._caretClass += ' clip-bl';
            break;
        }
        break;

      case popoverDirection.LEFT:
        this._boxClass += ' caret-pos-r';
        switch (opts.displacement) {
          case popoverDisplacement.AFTER:
            this._caretClass += ' clip-lt';
            break;
          case popoverDisplacement.NONE:
            this._caretClass += ' clip-lc';
            break;
          case popoverDisplacement.BEFORE:
            this._caretClass += ' clip-lb';
            break;
          default:
            this._caretClass += ' clip-lt';
            break;
        }
        break;

      case popoverDirection.RIGHT:
        this._boxClass += ' caret-pos-l';
        switch (opts.displacement) {
          case popoverDisplacement.AFTER:
            this._caretClass += ' clip-rt';
            break;
          case popoverDisplacement.NONE:
            this._caretClass += ' clip-rc';
            break;
          case popoverDisplacement.BEFORE:
            this._caretClass += ' clip-rb';
            break;
          default:
            this._caretClass += ' clip-rt';
            break;
        }
        break;

      case popoverDirection.ABOVE:
        this._boxClass += ' caret-pos-b';
        switch (opts.displacement) {
          case popoverDisplacement.AFTER:
            this._caretClass += ' clip-tl';
            break;
          case popoverDisplacement.NONE:
            this._caretClass += ' clip-tc';
            break;
          case popoverDisplacement.BEFORE:
            this._caretClass += ' clip-tr';
            break;
          default:
            this._caretClass += ' clip-tl';
            break;
        }
        break;

      default:
        this._boxClass += ' caret-pos-b';
        switch (opts.displacement) {
          case popoverDisplacement.AFTER:
            this._caretClass += ' clip-tl';
            break;
          case popoverDisplacement.NONE:
            this._caretClass += ' clip-tc';
            break;
          case popoverDisplacement.BEFORE:
            this._caretClass += ' clip-tr';
            break;
          default:
            this._caretClass += ' clip-tl';
            break;
        }
        break;
    }
  }

  private buildHostClass(opts: PopOverOpts) {
    const directionClass = popoverDirection[opts?.direction || popoverDirection.ABOVE];
    const spawnPointClass = 'attach' + popoverSpawn[opts?.spawnPoint || popoverSpawn.TOP_CENTER];

    const styleClasses = ['base', directionClass, spawnPointClass];
    switch (opts?.direction) {
      case popoverDirection.ABOVE:
        switch (opts?.displacement) {
          case popoverDisplacement.NONE:
            styleClasses.push('aboveCenter');
            break;
          case popoverDisplacement.BEFORE:
            styleClasses.push('aboveLeft');
            break;
          default:
            break;
        }
        break;
      case popoverDirection.LEFT:
        switch (opts?.displacement) {
          case popoverDisplacement.NONE:
            styleClasses.push('leftCenter');
            break;
          case popoverDisplacement.BEFORE:
            styleClasses.push('leftTop');
            break;
          default:
            break;
        }
        break;
      case popoverDirection.RIGHT:
        switch (opts?.displacement) {
          case popoverDisplacement.NONE:
            styleClasses.push('rightCenter');
            break;
          case popoverDisplacement.BEFORE:
            styleClasses.push('rightTop');
            break;
          default:
            break;
        }
        break;
      case popoverDirection.BELOW:
        switch (opts?.displacement) {
          case popoverDisplacement.NONE:
            styleClasses.push('belowCenter');
            break;
          case popoverDisplacement.BEFORE:
            styleClasses.push('belowLeft');
            break;
          default:
            break;
        }
        break;
      default:
        switch (opts?.displacement) {
          case popoverDisplacement.NONE:
            styleClasses.push('aboveCenter');
            break;
          case popoverDisplacement.BEFORE:
            styleClasses.push('aboveLeft');
            break;
          default:
            break;
        }
        break;
    }
    if (this.customClass !== '') {
      styleClasses.push(this.customClass);
    }
    return styleClasses.join(' ');
  }
}
