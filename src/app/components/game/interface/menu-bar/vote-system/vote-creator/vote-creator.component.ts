import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { GameStateService } from '../../../../../../services/game-state.service';
import { Player } from '../../../../../../model/state/Player';
import { VoteEntry } from '../helpers/VoteEntry';
import { VoteConfiguration } from '../helpers/VoteConfiguration';
import { GameActionType, MessageType } from '../../../../../../model/WsData';
import { ArraySchema, MapSchema } from '@colyseus/schema';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-vote-creator',
  templateUrl: './vote-creator.component.html',
  styleUrls: ['./vote-creator.component.css'],
})
export class VoteCreatorComponent implements OnInit, OnDestroy {
  @Output()
  voteConfiguration: EventEmitter<VoteConfiguration> = new EventEmitter<VoteConfiguration>();

  playerList: Player[] = [];

  private eligibilities: Map<string, boolean> = new Map<string, boolean>();
  votingOptions = new ArraySchema<VoteEntry>();

  // subscriptions
  private playerList$$: Subscription;

  constructor(private gameState: GameStateService) {}

  ngOnInit(): void {
    this.playerList$$ = this.gameState.observableState.playerList$.subscribe((playerList: MapSchema<Player>) => {
      this.playerList = [];
      playerList.forEach((player: Player) => {
        this.playerList.push(player);
      });
    });
  }

  ngOnDestroy(): void {
    this.playerList$$.unsubscribe();
  }

  isEligible(player: Player): boolean {
    if (this.eligibilities.has(player.displayName)) {
      return this.eligibilities.get(player.displayName);
    } else {
      this.eligibilities.set(player.displayName, true);
      return true;
    }
  }

  toggleEligibility(player: Player): void {
    // TODO: build solution to close vote if the host is ineligible
    this.gameState
      .getMe$()
      .pipe(take(1))
      .subscribe((me: Player) => {
        if (!(me.displayName === player.displayName)) {
          this.eligibilities.set(player.displayName, !this.isEligible(player));
        }
      });
  }

  addVoteEntryByKey(inputElement: HTMLInputElement, event: KeyboardEvent): void {
    if (event.code === 'Enter') {
      this.addVoteEntry(inputElement);
    }
  }

  addVoteEntry(inputElement: HTMLInputElement): void {
    const userInput = String(inputElement.value).trim();
    const correlatingPlayer = this.playerList.find((p) => p.displayName === userInput);
    if (userInput !== '') {
      if (correlatingPlayer !== undefined) {
        this.votingOptions.push(VoteEntry.fromPlayer(correlatingPlayer));
      } else {
        const ve = new VoteEntry();
        ve.text = userInput;
        this.votingOptions.push(ve);
      }
      inputElement.value = '';
    }
  }

  addAllPlayers(): void {
    this.playerList.forEach((p) => {
      if (this.votingOptions.find((o) => o.text === p.displayName) === undefined) {
        this.votingOptions.push(VoteEntry.fromPlayer(p));
      }
    });
  }

  removeEntry(entryIndex: number): void {
    this.votingOptions.splice(entryIndex, 1);
  }

  clearAllEntries(): void {
    this.votingOptions.clear();
  }

  emitVoting(titleElement: HTMLInputElement): void {
    const userInput = String(titleElement.value).trim();
    const currentPlayer = this.playerList.find((p) => p.loginName === this.gameState.getMyLoginName());

    let voteConfig: VoteConfiguration;
    if (currentPlayer !== undefined) {
      voteConfig = VoteConfiguration.build(userInput, currentPlayer.displayName, this.eligibilities, this.votingOptions);
    } else {
      voteConfig = VoteConfiguration.build(userInput, 'undefined', this.eligibilities, this.votingOptions);
    }

    if (voteConfig.votingOptions.length > 1) {
      this.voteConfiguration.emit(voteConfig);
    } else {
      alert('please ensure u have atleast 2 vote option');
    }
  }

  cancelVoteCreation(): void {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.stopVoteCreation,
    });
  }
}
