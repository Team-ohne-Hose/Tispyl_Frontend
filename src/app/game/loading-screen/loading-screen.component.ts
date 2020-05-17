import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.css']
})
export class LoadingScreenComponent implements OnInit {

  progress = 0;

  constructor() { }

  ngOnInit(): void {
  }

  setProgress(progress: number) {
    this.progress = Math.round(progress * 10) / 10;
  }
}
