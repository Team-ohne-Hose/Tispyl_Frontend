import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit, ViewEncapsulation } from '@angular/core';

export interface PopOverOpts {
  /** Selects the direction the box is 'popped out' towards */
  direction?: 'above' | 'below' | 'left' | 'right';

  /**
   * Selects the point to which the pop over element is attached to.
   * The following attachment points are available:
   *  (A)--(B)--(C)
   *   |    |    |
   *  (D)--(E)--(F)
   *   |    |    |
   *  (G)--(H)--(I)
   */
  attachmentPoint?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I';

  /**
   * Selects the positioning of the pop over element in reference to the attachment point. Assuming the direction to be:
   *  - above or below -> 0 = left bound, 1 = centered, 2 = right bound
   *  - left or right  -> 0 = top bound,  1 = centered, 2 = bottom bound
   *
   * Example: attachmentPoint = 'D' ; referencePoint = '0'
   *
   *                     (A)--------
   *                      |
   *     ---------(0) -> (D) Anchor
   *               |      |
   *     Pop over (1)    (G)--------
   *               |
   *     ---------(2)
   */
  referencePoint?: '0' | '1' | '2';
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

  ngOnInit(): void {
    this.forceAnchorStyle();
    const opts: PopOverOpts =
      this.options !== undefined ? this.options : { direction: 'above', referencePoint: '1', attachmentPoint: 'B' };
    this.selectCaret(opts);
    this._hostClass = this.buildHostClass(opts);
  }

  private forceAnchorStyle() {
    if (this.forcedAnchor !== undefined) {
      if (!(this.forcedAnchor.style.position === 'relative' || this.forcedAnchor.style.position === 'absolute')) {
        this.forcedAnchor.style.position = 'relative';
      }
    }
  }

  private selectCaret(opts: PopOverOpts) {
    switch (opts.direction) {
      case 'below':
        this._boxClass += ' caret-pos-t';
        switch (opts.referencePoint) {
          case '0':
            this._caretClass += ' clip-bl';
            break;
          case '1':
            this._caretClass += ' clip-bc';
            break;
          case '2':
            this._caretClass += ' clip-br';
            break;
          default:
            this._caretClass += ' clip-bl';
            break;
        }
        break;

      case 'left':
        this._boxClass += ' caret-pos-r';
        switch (opts.referencePoint) {
          case '0':
            this._caretClass += ' clip-lt';
            break;
          case '1':
            this._caretClass += ' clip-lc';
            break;
          case '2':
            this._caretClass += ' clip-lb';
            break;
          default:
            this._caretClass += ' clip-lt';
            break;
        }
        break;

      case 'right':
        this._boxClass += ' caret-pos-l';
        switch (opts.referencePoint) {
          case '0':
            this._caretClass += ' clip-rt';
            break;
          case '1':
            this._caretClass += ' clip-rc';
            break;
          case '2':
            this._caretClass += ' clip-rb';
            break;
          default:
            this._caretClass += ' clip-rt';
            break;
        }
        break;

      case 'above':
        this._boxClass += ' caret-pos-b';
        switch (opts.referencePoint) {
          case '0':
            this._caretClass += ' clip-tl';
            break;
          case '1':
            this._caretClass += ' clip-tc';
            break;
          case '2':
            this._caretClass += ' clip-tr';
            break;
          default:
            this._caretClass += ' clip-tl';
            break;
        }
        break;
      default:
        this._boxClass += ' caret-pos-b';
        switch (opts.referencePoint) {
          case '0':
            this._caretClass += ' clip-tl';
            break;
          case '1':
            this._caretClass += ' clip-tc';
            break;
          case '2':
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
    const styleClasses = ['base', opts?.direction || 'above', 'attach' + (opts?.attachmentPoint || 'B')];
    switch (opts?.direction) {
      case 'above':
        switch (opts?.referencePoint) {
          case '1':
            styleClasses.push('aboveCenter');
            break;
          case '2':
            styleClasses.push('aboveLeft');
            break;
          default:
            break;
        }
        break;
      case 'left':
        switch (opts?.referencePoint) {
          case '1':
            styleClasses.push('leftCenter');
            break;
          case '2':
            styleClasses.push('leftTop');
            break;
          default:
            break;
        }
        break;
      case 'right':
        switch (opts?.referencePoint) {
          case '1':
            styleClasses.push('rightCenter');
            break;
          case '2':
            styleClasses.push('rightTop');
            break;
          default:
            break;
        }
        break;
      case 'below':
        switch (opts?.referencePoint) {
          case '1':
            styleClasses.push('belowCenter');
            break;
          case '2':
            styleClasses.push('belowLeft');
            break;
          default:
            break;
        }
        break;
      default:
        switch (opts?.referencePoint) {
          case '1':
            styleClasses.push('aboveCenter');
            break;
          case '2':
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
