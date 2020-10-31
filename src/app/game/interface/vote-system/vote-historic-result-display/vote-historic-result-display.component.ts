import {Component, Input} from '@angular/core';
import {VoteResult} from '../VoteResult';

@Component({
  selector: 'app-vote-result-display',
  templateUrl: './vote-historic-result-display.component.html',
  styleUrls: ['./vote-historic-result-display.component.css']
})
export class VoteHistoricResultDisplayComponent {

  snoozeImagePath = '../../../../assets/snooze.png';

  @Input()
  currentResult: VoteResult = undefined;

  @Input()
  totalVoteCount: number = 0;

  constructor() { }

}
