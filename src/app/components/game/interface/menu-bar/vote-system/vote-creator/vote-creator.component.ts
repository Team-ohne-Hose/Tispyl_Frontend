import { Component, EventEmitter, Output } from '@angular/core';
import { GameStateService } from '../../../../../../services/game-state.service';
import { Player } from '../../../../../../model/state/Player';
import { VoteEntry } from '../helpers/VoteEntry';
import { VoteConfiguration } from '../helpers/VoteConfiguration';
import { GameActionType, MessageType } from '../../../../../../model/WsData';
import { ArraySchema } from '@colyseus/schema';

@Component({
  selector: 'app-vote-creator',
  templateUrl: './vote-creator.component.html',
  styleUrls: ['./vote-creator.component.css'],
})
export class VoteCreatorComponent {
  @Output()
  voteConfiguration: EventEmitter<VoteConfiguration> = new EventEmitter<VoteConfiguration>();

  playerList: Player[] = [];

  eligibilities: Map<string, boolean> = new Map<string, boolean>();
  votingOptions = new ArraySchema<VoteEntry>();

  constructor(private gameState: GameStateService) {
    this.gameState.isRoomDataAvailable$.subscribe((isAvailable: boolean) => {
      if (isAvailable) {
        this.gameState.forEachPlayer((p: Player) => {
          this.playerList.push(p);
        });
      } else {
        console.warn('Failed to update player list. GameState was: ', this.gameState.getState());
      }
      this.playerList.forEach((p) => this.eligibilities.set(p.displayName, true));
    });
  }

  toggleEligibility(player: Player): void {
    // TODO: build solution to close vote if the host is ineligible
    if (!(this.gameState.getMe().displayName === player.displayName)) {
      this.eligibilities.set(player.displayName, !this.eligibilities.get(player.displayName));
    }
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
