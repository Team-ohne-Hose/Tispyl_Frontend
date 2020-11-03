import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {GameStateService} from '../../../services/game-state.service';
import {GameActionType, MessageType, WsData} from '../../../model/WsData';
import {FileService} from '../../../services/file.service';
import {DataChange} from '@colyseus/schema';
import {VoteSystemState} from './VoteSystemState';
import {VoteResult} from './VoteResult';
import {VoteEntry} from './VoteEntry';
import {VoteConfiguration} from './VoteConfiguration';



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
    gameState.addVoteSystemCallback(((changes: DataChange<any>[]) => {
      changes.forEach((change: DataChange) => {
        switch (change.field) {
          case 'author': this.onAuthorChange(change); break;
          case 'activeVoteConfiguration': this.onActiveVoteConfigurationChange(change); break;
          case 'closingIn': this.timerDisplay = this.gameState.getState().voteState.closingIn; break;
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
    if (this.gameState.getState() !== undefined) {
      const remoteState = this.gameState.getState().voteState;
      if (remoteState.activeVoteConfiguration !== undefined) {
        const pseudoChange: DataChange<VoteConfiguration> = {
          op: 0,
          field: 'activeVoteConfiguration',
          value: remoteState.activeVoteConfiguration,
          previousValue: undefined
        };
        this.onActiveVoteConfigurationChange(pseudoChange);
        this.timerDisplay = this.gameState.getState().voteState.closingIn;

      } else {
        if (remoteState.author === this.gameState.getMe().displayName) {
          this.voteSystemState = VoteSystemState.creating;
          this.voteHost = remoteState.author;

        } else if (remoteState.creationInProgress) {
          this.voteSystemState = VoteSystemState.waiting;
          this.voteHost = remoteState.author;

        } else {
          this.voteSystemState = VoteSystemState.default;
        }
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
  /**
   * This not only updates the current voteSystemState but also recalculates voting percentages
   * for the displayed vote entries to avoid a function call inside of the Angular html template.
   *
   * This would cause a large performance hit. @see [https://medium.com/showpad-engineering/why-you-should-never-use-function-calls-in-angular-template-expressions-e1a50f9c0496]
   */
  onActiveVoteConfigurationChange(change: DataChange<VoteConfiguration>): void {
    if (change.value !== undefined && change.value !== null) {
      this.hasConcluded = change.value.hasConcluded;
      if (this.hasConcluded) {
        this.voteSystemState = VoteSystemState.results;
        this.notifyPlayer.emit(VoteSystemState.results);
      } else if (change.value.ineligibles.includes(this.gameState.getMe().displayName)) {
        this.voteSystemState = VoteSystemState.notEligible;
      } else {
        this.voteSystemState = VoteSystemState.voting;
        this.notifyPlayer.emit(VoteSystemState.voting);
      }
      // Update vote entry display values
      this.voteEntryPercentileDisplay = [];
      for (const votingOption of change.value.votingOptions) {
        this.voteEntryPercentileDisplay.push(this.getPercentile(votingOption));
      }
    }
  }

  onAuthorChange(change: DataChange): void {
    this.voteHost = change.value;
    if (change.value === this.gameState.getMe().displayName) {
      this.voteSystemState = VoteSystemState.creating;
    } else {
      this.voteSystemState = VoteSystemState.waiting;
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
    if ( this.gameState.getState() !== undefined ) {
      this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.playerCastVote,
        elementIndex: idx
      });
    }
  }

  getPercentile(ve: VoteEntry): number {
    const remoteState = this.gameState.getState();
    let percentile = 0;
    if (remoteState !== undefined && remoteState.voteState.activeVoteConfiguration !== undefined) {
      // Workaround until colyseus 0.14 update, should be replaced by .size()
      let playerListSize: number = 0;
      for ( const p in remoteState.playerList) {
        if ( p in remoteState.playerList ) {
          playerListSize += 1;
        }
      }
      ///////////////////////////////////
      const max = playerListSize - remoteState.voteState.activeVoteConfiguration.ineligibles.length;
      percentile = ( ve.castVotes.length / max ) * 100;
    }
    return percentile;
  }

}
