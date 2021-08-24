export class Timer {
  private readonly onProgress_callback: () => void;
  private readonly onFinished_callback: () => void;
  private readonly onPause_callback: () => void;
  private readonly onResume_callback: () => void;
  private readonly onReset_callback: () => void;

  private readonly frequency;
  private readonly tMax;
  private tCurrent;

  private intervalId = undefined;
  private isPaused = false;

  /**
   * Simple timer class with multiple callbacks for timer related situations. As a timer is not that complicated in JS, this class is meant
   * to replace any third party npm module for a timer to allow us to tailor its functionality to our needs. It provides multiple callbacks
   * could be extended in the future if new use cases pop up.
   *
   * @param duration time until the timer completes in milli seconds
   * @param frequency polling delta in ms. This determines the frequency at which 'onProgress' is called
   * @param callbacks a number of callbacks called at different times during the timers life cycle:
   *    - onProgress:   called each time step
   *    - onFinished:   called if and only if the timer completes normally (tCurrent >= tMax)
   *    - onPause:      called if the 'pause()' method is called
   *    - onResume:     called if the 'resume()' method is called
   *    - onReset:      called if the timer completes normally or is reset before hand by calling 'reset()'
   */
  constructor(
    duration: number,
    frequency: number,
    callbacks?: {
      onProgress?: () => void;
      onFinished?: () => void;
      onPause?: () => void;
      onResume?: () => void;
      onReset?: () => void;
    }
  ) {
    this.onProgress_callback = callbacks.onProgress !== undefined ? callbacks.onProgress : this._noOp;
    this.onFinished_callback = callbacks.onFinished !== undefined ? callbacks.onFinished : this._noOp;
    this.onPause_callback = callbacks.onPause !== undefined ? callbacks.onPause : this._noOp;
    this.onResume_callback = callbacks.onResume !== undefined ? callbacks.onResume : this._noOp;
    this.onReset_callback = callbacks.onReset !== undefined ? callbacks.onReset : this._noOp;

    this.frequency = frequency;
    this.tMax = duration;
    this.tCurrent = 0;
  }

  start(): void {
    if (this.intervalId === undefined && !this.isPaused) {
      this.intervalId = this._setInterval();
    }
  }

  reset(): void {
    clearInterval(this.intervalId);
    this.intervalId = undefined;
    this.isPaused = false;
    this.tCurrent = 0;
    this.onReset_callback();
  }

  pause(): void {
    if (this.intervalId !== undefined && !this.isPaused) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.isPaused = true;
      this.onPause_callback();
    }
  }

  resume(): void {
    if (this.intervalId === undefined && this.isPaused) {
      this.intervalId = this._setInterval();
      this.isPaused = false;
    }
  }

  isActive(): boolean {
    return this.intervalId !== undefined || this.isPaused;
  }

  private _setInterval(): number {
    return setInterval(() => {
      this.tCurrent += this.frequency;
      this.onProgress_callback();
      if (this.tCurrent >= this.tMax) {
        this.reset();
        this.onFinished_callback();
      }
    }, this.frequency);
  }

  private _noOp(): void {
    // Do nothing
  }

  /** Getter functions */

  getCurrentTime(): number {
    return this.tCurrent;
  }

  getMaxTime(): number {
    return this.tMax;
  }

  getStep(): number {
    return this.frequency;
  }
}
