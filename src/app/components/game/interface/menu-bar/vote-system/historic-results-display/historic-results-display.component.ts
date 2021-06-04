import { Component, Input } from '@angular/core';
import { VoteResult } from '../helpers/VoteResult';

@Component({
  selector: 'app-historic-results-display',
  templateUrl: './historic-results-display.component.html',
  styleUrls: ['./historic-results-display.component.css'],
})
export class HistoricResultsDisplayComponent {
  snoozeImagePath = '../../../../assets/snooze.png';

  @Input()
  currentResult: VoteResult = undefined;

  @Input()
  totalVoteCount = 0;
}
