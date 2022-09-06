import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { GameStateService } from '../../../../../services/game-state.service';
import { GameActionType, MessageType } from '../../../../../model/WsData';
import { ArraySchema, MapSchema } from '@colyseus/schema';
import { VoteSystemState } from './helpers/VoteSystemState';
import { VoteResult } from './helpers/VoteResult';
import { VoteEntry } from './helpers/VoteEntry';
import { VoteConfiguration } from './helpers/VoteConfiguration';
import { VoteStage } from '../../../../../model/state/VoteState';
import { Player } from 'src/app/model/state/Player';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-vote-system',
  templateUrl: './vote-system.component.html',
  styleUrls: ['./vote-system.component.css'],
})
export class VoteSystemComponent implements OnInit, OnDestroy {
  readonly stateEnum = VoteSystemState;
  voteSystemState: VoteSystemState = VoteSystemState.default;

  // Data values
  resultHistory: VoteResult[] = []; // TODO: (Not used yet) Find way to keep these values without putting them into the state

  // Display values
  currentHistoryResult = 0;
  voteHost: string;
  voteEntryPercentileDisplay: number[] = [];
  timerDisplay = -1;
  hasConcluded = false;

  // Events
  @Output()
  notifyPlayer: EventEmitter<number> = new EventEmitter<number>();

  // variables for calculating Voting Metrics
  private votingOptions: ArraySchema<VoteEntry>;
  private ineligibles: ArraySchema<string>;

  // subscriptions
  private setWaitingCreating$$: Subscription;
  private votingOptions$$: Subscription;
  private ineligibles$$: Subscription;
  private calcVotes$$: Subscription;
  private closingIn$$: Subscription;
  private voteStage$$: Subscription;
  private voteHost$$: Subscription;

  constructor(public gameState: GameStateService) {}
  ngOnInit(): void {
    /**
     * This recalculates voting percentages
     * for the displayed vote entries to avoid a function call inside of the Angular html template.
     *
     * This would cause a large performance hit.
     * @see [https://medium.com/showpad-engineering/why-you-should-never-use-function-calls-in-angular-template-expressions-e1a50f9c0496]
     */

    this.votingOptions$$ = this.gameState.observableState.voteState.voteConfiguration.votingOptions$.subscribe(
      (votingOptions: ArraySchema<VoteEntry>) => {
        this.votingOptions = votingOptions;
      }
    );
    this.ineligibles$$ = this.gameState.observableState.voteState.voteConfiguration.ineligibles$.subscribe(
      (ineligibles: ArraySchema<string>) => {
        this.ineligibles = ineligibles;
      }
    );
    this.closingIn$$ = this.gameState.observableState.voteState.closingIn$.subscribe((closingIn: number) => {
      this.timerDisplay = closingIn;
    });
    this.voteStage$$ = this.gameState.observableState.voteState.voteStage$.subscribe((voteStage: VoteStage) => {
      this.onVoteStageChange(voteStage);
    });
    this.voteHost$$ = this.gameState.observableState.voteState.author$.subscribe((author: string) => {
      this.voteHost = author;
    });

    // calcVotes
    this.calcVotes$$ = combineLatest({
      votingOptions: this.gameState.observableState.voteState.voteConfiguration.votingOptions$,
      ineligibles: this.gameState.observableState.voteState.voteConfiguration.ineligibles$,
      playerList: this.gameState.observableState.playerList$,
    }).subscribe((values: { votingOptions: ArraySchema<VoteEntry>; ineligibles: ArraySchema<string>; playerList: MapSchema<Player> }) => {
      console.log('combineLatest calcVotes ', values.votingOptions, values.ineligibles, values.playerList);
      const totalPlayerCount = values.playerList.size;
      this.voteEntryPercentileDisplay = [];
      values.votingOptions.forEach((voteEntry: VoteEntry) => {
        const val = this.getPercentile(voteEntry, values.ineligibles, totalPlayerCount);
        this.voteEntryPercentileDisplay.push(val);
        console.log('calculating percentile for ', voteEntry, val);
      });
    });

    // set Waiting/Creating
    this.setWaitingCreating$$ = combineLatest({
      voteStage: this.gameState.observableState.voteState.voteStage$,
      voteHost: this.gameState.observableState.voteState.author$,
      me: this.gameState.getMe$(),
    }).subscribe((values: { voteStage: VoteStage; voteHost: string; me: Player }) => {
      if (values.voteStage === VoteStage.CREATION) {
        if (values.voteHost === values.me.displayName) {
          this.voteSystemState = VoteSystemState.creating;
        } else {
          this.voteSystemState = VoteSystemState.waiting;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.setWaitingCreating$$.unsubscribe();
    this.votingOptions$$.unsubscribe();
    this.ineligibles$$.unsubscribe();
    this.calcVotes$$.unsubscribe();
    this.closingIn$$.unsubscribe();
    this.voteStage$$.unsubscribe();
    this.voteHost$$.unsubscribe();
  }

  previousHistoricResult(): void {
    this.currentHistoryResult--;
    if (this.currentHistoryResult < 0) {
      this.currentHistoryResult = this.resultHistory.length - 1;
    }
    console.log(this.currentHistoryResult, this.resultHistory);
  }

  nextHistoricResult(): void {
    this.currentHistoryResult++;
    if (this.currentHistoryResult > this.resultHistory.length - 1) {
      this.currentHistoryResult = 0;
    }
  }

  // Triggers
  triggerVoteBegin(config: VoteConfiguration): void {
    console.error('begin vote', config);
    const messageData = {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.beginVotingSession,
      config: config,
    };
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, messageData);
  }

  triggerVoteCreation(): void {
    if (this.gameState.getMe() !== undefined) {
      this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
        type: MessageType.GAME_MESSAGE,
        action: GameActionType.startVoteCreation,
        author: this.gameState.getMe().displayName,
      });
    }
  }

  triggerCloseVotingSession(): void {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.closeVotingSession,
    });
  }

  // Reactions
  getPercentile(ve: VoteEntry, ineligibles: ArraySchema<string>, totalPlayerCount: number): number {
    if (ineligibles === undefined || ve?.castVotes === undefined || totalPlayerCount === ineligibles.length) {
      return 0;
    } else {
      const max = totalPlayerCount - ineligibles.length;
      return (ve.castVotes.length / max) * 100;
    }
  }

  onVoteStageChange(stage: VoteStage): void {
    switch (stage) {
      case VoteStage.IDLE:
        this.hasConcluded = true;
        console.log('Entering Voting IDLE, ', this.votingOptions?.length > 0, this.votingOptions);
        if (this.votingOptions?.length > 0) {
          this.voteSystemState = VoteSystemState.results;
          this.notifyPlayer.emit(VoteSystemState.results);
          // TODO: maybe need to force Vote calculation here
        } else {
          this.voteSystemState = VoteSystemState.default;
        }
        break;
      case VoteStage.CREATION:
        this.hasConcluded = true;
        break;
      case VoteStage.VOTE:
        this.hasConcluded = false;
        if (this.ineligibles && this.ineligibles.includes(this.gameState.getMe().displayName)) {
          this.voteSystemState = VoteSystemState.notEligible;
        } else {
          this.voteSystemState = VoteSystemState.voting;
          this.notifyPlayer.emit(VoteSystemState.voting);
        }
        // TODO: maybe need to force Vote calculation here
        break;
      default:
        console.warn('undefined VoteStage! Something likely went wrong', stage);
    }
  }

  castVote(idx: number): void {
    // Color selected value in HTML
    const selectionClass = 'selected';
    const choices: HTMLCollectionOf<Element> = document.getElementsByClassName('vote-entry');
    for (let i = 0; i < choices.length; i++) {
      choices[i].classList.remove(selectionClass);
    }
    choices[idx].classList.add(selectionClass);

    // Notify server
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.playerCastVote,
      elementIndex: idx,
    });
  }
}
