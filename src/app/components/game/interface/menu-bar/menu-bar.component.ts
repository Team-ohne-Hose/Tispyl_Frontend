import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { faClipboard, faGears, faHome, faPersonBooth } from '@fortawesome/free-solid-svg-icons';
import { Player } from '../../../../model/state/Player';
import { GameStateService } from '../../../../services/game-state.service';
import { VoteStage } from '../../../../model/state/VoteState';

export enum TabIndex {
  CLOSED,
  HOME,
  RULES,
  VOTE,
  SETTINGS,
}

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css'],
})
export class MenuBarComponent implements OnDestroy {
  @Input() playerList: Player[];
  @Input() ruleList = [];

  @ViewChild('registerFooter') registerFooter: ElementRef;
  @ViewChild('tabEdge') tabEdge: ElementRef;

  readonly TABS = TabIndex;

  public tabIndex: TabIndex = TabIndex.CLOSED;

  // Font Awesome Icons
  public faGears = faGears;
  public faPersonBooth = faPersonBooth;
  public faClipboard = faClipboard;
  public faHome = faHome;

  private voteBegin$$;
  private voteClose$$;

  constructor(private gameState: GameStateService) {
    this.voteBegin$$ = this.gameState.observableState.voteState.voteStage$.subscribe((stage) => {
      if (stage === VoteStage.VOTE) {
        this.selectTab(this.TABS.VOTE);
      }
    });
    this.voteClose$$ = this.gameState.observableState.voteState.closingIn$.subscribe((secondsLeft) => {
      if (secondsLeft === 1) {
        this.selectTab(this.TABS.VOTE);
      }
    });
  }

  toggleTab(targetTabIndex: TabIndex): void {
    if (this.tabIndex === targetTabIndex) {
      this.unselectTab(targetTabIndex);
    } else {
      this.selectTab(targetTabIndex);
    }
  }

  private selectTab(targetTabIndex: TabIndex): void {
    this.tabIndex = targetTabIndex;
  }

  private unselectTab(targetTabIndex: TabIndex): void {
    if (this.tabIndex === targetTabIndex) {
      this.tabIndex = TabIndex.CLOSED;
    }
  }

  ngOnDestroy(): void {
    this.voteBegin$$.unsubscribe();
    this.voteClose$$.unsubscribe();
  }
}
