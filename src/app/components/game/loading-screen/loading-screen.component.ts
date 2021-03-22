import {Component, OnInit, ViewChild} from '@angular/core';
import {HintsService} from '../../../services/hints.service';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.css']
})
export class LoadingScreenComponent implements OnInit {

  progress = 0;

  private timeOutRef: number;
  currentTip = '...';

  constructor(private hints: HintsService) { }

  ngOnInit(): void {
  }

  setProgress(progress: number) {
    this.progress = Math.round(progress * 10) / 10;
  }

  private newTip() {
    this.currentTip = 'Tipp: ' + this.hints.getRandomHint();
  }
  startTips() {
    this.newTip();
    this.timeOutRef = window.setInterval(this.newTip.bind(this), 5000);
  }
  stopTips() {
    if (this.timeOutRef !== undefined) {
      window.clearInterval(this.timeOutRef);
      this.timeOutRef = undefined;
    }
  }
}
