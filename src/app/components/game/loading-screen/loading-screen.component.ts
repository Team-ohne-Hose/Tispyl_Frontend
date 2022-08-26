import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { HintsService } from '../../../services/hints.service';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingScreenComponent {
  isWaiting = true;
  logoSource = 'assets/logo.png';
  progress = 0;
  currentTip = '...';
  private timeOutRef: number;

  constructor(private hints: HintsService, private ref: ChangeDetectorRef) {}

  setProgress(progress: number): void {
    this.progress = Math.round(progress * 10) / 10;
    this.ref.detectChanges();
  }

  startTips(): void {
    this.newTip();
    this.timeOutRef = setInterval(this.newTip.bind(this), 5000);
  }

  stopTips(): void {
    if (this.timeOutRef !== undefined) {
      clearInterval(this.timeOutRef);
      this.timeOutRef = undefined;
    }
  }

  private newTip(): void {
    this.currentTip = 'Tipp: ' + this.hints.getRandomHint();
    this.ref.markForCheck();
  }
}
