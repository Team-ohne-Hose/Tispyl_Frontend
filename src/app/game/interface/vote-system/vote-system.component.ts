import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {GameStateService} from '../../../services/game-state.service';
import {GameActionType, MessageType} from '../../../model/WsData';
import {DataChange} from '@colyseus/schema';
import {VoteSystemState} from './VoteSystemState';
import {VoteResult} from './VoteResult';
import {VoteEntry} from './VoteEntry';
import {VoteConfiguration} from './VoteConfiguration';
import {VoteStage} from '../../../model/state/VoteState';


@Component({
  selector: 'app-vote-system',
  templateUrl: './vote-system.component.html',
  styleUrls: ['./vote-system.component.css']
})
export class VoteSystemComponent implements OnInit {

  readonly stateEnum = VoteSystemState;
  voteSystemState: VoteSystemState = VoteSystemState.default;

  // Data values
  resultHistory: VoteResult[] = []; // TODO: (Not used yet) Find way to keep these values without putting them into the state

  // Display values
  currentHistoryResult: number = 0;
  voteHost: string;
  voteEntryPercentileDisplay: number[] = [];
  timerDisplay: number = -1;
  hasConcluded: boolean = false;

  // Events
  @Output()
  notifyPlayer: EventEmitter<number> = new EventEmitter<number>();

  constructor(public gameState: GameStateService) {
    gameState.addVoteStageCallback(this.onVoteStageChange.bind(this));

    /**
     * This recalculates voting percentages
     * for the displayed vote entries to avoid a function call inside of the Angular html template.
     *
     * This would cause a large performance hit. @see [https://medium.com/showpad-engineering/why-you-should-never-use-function-calls-in-angular-template-expressions-e1a50f9c0496]
     */
    gameState.addVoteCastCallback(this.calcVotes.bind(this));

    gameState.addVoteSystemCallback(((changes: DataChange<any>[]) => {
      changes.forEach((change: DataChange) => {
        switch (change.field) {
          case 'closingIn': this.timerDisplay = this.gameState.getVoteState().closingIn; break;
        }
      });
    }).bind(this));
  }

  /**
   * Synchronises component state values with their remote counterpart.
   * This is necessary when the component gets re-initialized during closing and opening of parent containers,
   * or if the player joins after the remote was altered from its default state.
   */
  ngOnInit(): void {
    if (this.gameState.isGameLoaded()) {
      const remoteState = this.gameState.getVoteState();
      if (remoteState.voteStage === VoteStage.IDLE) {
        this.voteSystemState = VoteSystemState.default;
        this.hasConcluded = true;
      } else {
        this.onVoteStageChange(remoteState.voteStage);
      }
    }
  }

  previousHistoricResult() {
    this.currentHistoryResult--;
    if ( this.currentHistoryResult < 0 ) { this.currentHistoryResult = this.resultHistory.length - 1; }
    console.log(this.currentHistoryResult, this.resultHistory);
  }

  nextHistoricResult() {
    this.currentHistoryResult++;
    if ( this.currentHistoryResult > this.resultHistory.length - 1 ) { this.currentHistoryResult = 0; }
  }

  // Triggers
  triggerVoteBegin(config: VoteConfiguration): void {
    const messageData = {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.beginVotingSession,
      config: config
    };
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, messageData);
  }

  triggerVoteCreation(event: Event): void {
    if (this.gameState.getMe() !== undefined) {
      this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.startVoteCreation,
        author: this.gameState.getMe().displayName
      });
    }
  }

  triggerCloseVotingSession(event: Event): void {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.closeVotingSession
    });
  }

  // Reactions
  calcVotes() {
    this.voteEntryPercentileDisplay = [];
    for (const votingOption of this.gameState.getVoteState().voteConfiguration.votingOptions) {
      this.voteEntryPercentileDisplay.push(this.getPercentile(votingOption));
    }
  }
  onVoteStageChange(stage: VoteStage) {
    switch (stage) {
      case VoteStage.IDLE:
        this.hasConcluded = true;
        this.voteSystemState = VoteSystemState.results;
        this.notifyPlayer.emit(VoteSystemState.results);
        this.calcVotes();
        break;
      case VoteStage.CREATION:
        this.hasConcluded = true;
        this.voteHost = this.gameState.getVoteState().author;
        console.log('setting voteHost to', this.voteHost.toString());
        if (this.voteHost === this.gameState.getMe().displayName) {
          this.voteSystemState = VoteSystemState.creating;
        } else {
          this.voteSystemState = VoteSystemState.waiting;
        }
        break;
      case VoteStage.VOTE:
        this.hasConcluded = false;
        this.voteHost = this.gameState.getVoteState().author;
        if (this.gameState.getVoteState().voteConfiguration.ineligibles.includes(this.gameState.getMe().displayName)) {
          this.voteSystemState = VoteSystemState.notEligible;
        } else {
          this.voteSystemState = VoteSystemState.voting;
          this.notifyPlayer.emit(VoteSystemState.voting);
        }
        this.calcVotes();
        break;
      default:
        console.warn('undefined VoteStage! Something likely went wrong');
    }
  }

  castVote(idx: number): void {
    // Color selected value in HTML
    const selectionClass = 'selected';
    const choices: HTMLCollectionOf<Element> = document.getElementsByClassName('vote-entry');
    for ( let i = 0; i < choices.length; i++ ) {
      choices[i].classList.remove(selectionClass);
    }
    choices[idx].classList.add(selectionClass);

    // Notify server
    if (this.gameState.isGameLoaded()) {
      this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.playerCastVote,
        elementIndex: idx
      });
    }
  }

  getPercentile(ve: VoteEntry): number {
    const voteState = this.gameState.getVoteState();
    let percentile = 0;
    if (voteState?.voteConfiguration !== undefined) {
      const playerListSize = this.gameState.getPlayerArray().length;
      ///////////////////////////////////
      const max = playerListSize - voteState.voteConfiguration.ineligibles.length;
      percentile = ( ve.castVotes.length / max ) * 100;
    }
    return percentile;
  }

}
