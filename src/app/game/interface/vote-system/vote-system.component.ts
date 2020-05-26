import {Component, Input} from '@angular/core';
import {GameStateService} from '../../../services/game-state.service';
import {Player} from '../../../model/state/Player';
import {GameActionType, MessageType, WsData} from '../../../model/WsData';
import {ColyseusNotifyable} from '../../../services/game-initialisation.service';
import {FileService} from '../../../services/file.service';
import {MatChipInputEvent} from '@angular/material/chips';
import {Option} from '../../../debugdummy/debugdummy.component';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {DataChange} from '@colyseus/schema';

enum VoteState {
  default,
  waiting,
  creating,
  voting,
  results
}
interface VoteEntry {
  label: string;
  count: number;
  isPlayer: boolean;
  login: string;
}
@Component({
  selector: 'app-vote-system',
  templateUrl: './vote-system.component.html',
  styleUrls: ['./vote-system.component.css']
})
export class VoteSystemComponent implements ColyseusNotifyable {

  VoteState = VoteState;

  @Input()
  players: Player[];
  hidden = true;
  showState: VoteState = VoteState.default;
  voteResults: VoteEntry[] = [];
  voteOptions: VoteEntry[] = [];

  votedFor = '';

  // for creation of vote
  playerDeselected: Map<string, boolean> = new Map<string, boolean>();
  options: Option[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(public gameState: GameStateService, public fileService: FileService) { }

  attachColyseusMessageCallbacks(): void {
    this.gameState.registerMessageCallback(MessageType.GAME_MESSAGE, {
      f: ((data: WsData) => {
        if (data !== undefined && data.type === MessageType.GAME_MESSAGE) {
          switch (data.action) {
            case GameActionType.startCreateVote:
              if (data.authorLogin === this.gameState.getMyLoginName()) {
                this.showState = VoteState.creating;
                console.log('create a vote!');
              } else {
                this.showState = VoteState.waiting;
                console.log('vote is being created');
              }
              break;
            case GameActionType.openVote:
              this.voteOptions = this.getOptions();
              console.log('start voting', this.voteOptions);
              this.votedFor = '';
              this.showState = VoteState.voting;
              this.hidden = false;
              break;
            case GameActionType.closeVote:
              this.voteResults = this.getVotes();
              console.log('showing Results', this.voteResults);
              this.showState = VoteState.results;
              break;
          }
        }
      }).bind(this), filterSubType: undefined});
  }
  attachColyseusStateCallbacks(): void {
    this.gameState.addVoteSystemCallback(((changes: DataChange<any>[]) => {
      changes.forEach((change: DataChange) => {
        switch (change.field) {
          case 'author':
            if (change.value !== undefined && change.value !== '') {

            }
            break;
        }
      });
    }).bind(this));
  }

  toggleMove( ev ) {
    this.hidden = !this.hidden;
  }
  vote(option: string): void {
    if (this.eligibleToVote()) {
      this.gameState.sendMessage({type: MessageType.GAME_MESSAGE, action: GameActionType.playerVote, vote: option});
      this.votedFor = option;
    }
  }
  closeVoting(): void {
    this.gameState.sendMessage({
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.closeVote
    });
  }
  createNewVoting(): void {
    this.gameState.sendMessage({
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.startCreateVote,
      authorLogin: this.gameState.getMyLoginName()
    });
    this.options = [];
    this.playerDeselected.forEach((val: boolean, key: string) => {
      this.playerDeselected.set(key, false);
    });
  }
  startNewVote() {
    const eligible = this.players.filter((val: Player) => {
      return !this.playerDeselected.get(val.loginName);
    }).map((val: Player) => {
      return val.loginName;
    });
    if (this.options !== undefined && this.options.length > 0) {
      this.gameState.sendMessage({type: MessageType.GAME_MESSAGE,
        action: GameActionType.createVote,
        authorId: this.gameState.getMyLoginName(),
        eligible: eligible,
        customVote: true,
        options: this.options.map((val: Option) => {
          return val.name;
        })});
    } else {
      this.gameState.sendMessage({type: MessageType.GAME_MESSAGE,
        action: GameActionType.createVote,
        authorId: this.gameState.getMyLoginName(),
        eligible: eligible,
        customVote: false,
        options: []});
    }
  }

  getOptions(): VoteEntry[] {
    const state = this.gameState.getState();
    if (state !== undefined) {
      if (state.voteState.isCustom) {
        console.log('customVote', state.voteState.isCustom, state.voteState.customOptions);
        const options: VoteEntry[] = [];
        state.voteState.customOptions.forEach((value: string) => {
          const playerEntry = this.players.find((value2: Player) => {
            return value2.displayName === value;
          });
          if (playerEntry === undefined) {
            options.push({label: value, count: 0, isPlayer: false, login: ''});
          } else {
            options.push({label: value, count: 0, isPlayer: true, login: playerEntry.loginName});
          }
        });
        return options;
      } else {
        console.log('defaultVote', state.voteState.isCustom, this.players);
        return this.players.map<VoteEntry>((p: Player) => {
          return {label: p.displayName, count: 0, isPlayer: true, login: p.loginName};
        });
      }
    } else {
      return [];
    }
  }
  getVotes(): VoteEntry[] {
    const votes: VoteEntry[] = [];
    const state = this.gameState.getState();
    if (state !== undefined) {
      if (state.voteState.isCustom) {
        state.voteState.customOptions.forEach((value: string) => {
          const playerEntry = this.players.find((value2: Player) => {
            return value2.displayName === value;
          });
          if (playerEntry === undefined) {
            votes.push({label: value, count: 0, isPlayer: false, login: ''});
          } else {
            votes.push({label: value, count: 0, isPlayer: true, login: playerEntry.loginName});
          }
        });
      } else {
        this.players.forEach((value: Player) => {
          votes.push({label: value.displayName, count: 0, isPlayer: true, login: value.loginName});
        });
      }
      const allVotes = state.voteState.votes;
      for (const key in allVotes) {
        if (key in allVotes) {
          const voteEntry: VoteEntry = votes.find((value: VoteEntry) => {
            return (value.label === allVotes[key].vote);
          });
          if (voteEntry !== undefined) {
            voteEntry.count++;
          } else {
            console.warn('couldnt find entry!', allVotes[key].vote, votes);
          }
        }
      }
      const results = votes.sort((a: VoteEntry, b: VoteEntry) => {
        return -(a.count - b.count);
      });
      console.log('returning Results', results, this.players, state.voteState.customOptions);
      return results;
    } else {
      return [];
    }
  }
  eligibleToVote(): boolean {
    const state = this.gameState.getState();
    if (state !== undefined) {
      const eligible = (state.voteState.eligibleLoginNames.find((value: string) => {
        return value === this.gameState.getMyLoginName();
      }));
      return eligible !== undefined;
    }
    return false;
  }
  getTitle(): string {
    const state = this.gameState.getState();
    if (state !== undefined) {
      if (state.voteState.author !== undefined && state.voteState.author.length > 0) {
        const player: Player = state.playerList[state.voteState.author];
        if (player !== undefined) {
          return 'Vote System:  ' + player.displayName + '\'s Vote';
        } else {
          return 'Vote System';
        }
      } else {
        return 'Vote System';
      }
    } else {
      return 'Vote System';
    }
  }

  addOption(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our option
    if ((value || '').trim()) {
      if (this.options.find((opt: Option) => {
        return opt.name === value.trim();
      }) === undefined) {
        this.options.push({name: value.trim()});
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
  removeOption(option: Option): void {
    const index = this.options.indexOf(option);
    if (index >= 0) {
      this.options.splice(index, 1);
    }
  }
  togglePlayer(p: Player) {
    // console.log('toggle Player', p.loginName);
    const selected = this.playerDeselected.get(p.loginName);
    if (selected) {
      this.playerDeselected.set(p.loginName, false);
    } else {
      this.playerDeselected.set(p.loginName, true);
    }
  }
  clearOptions() {
    this.options = [];
  }
  addPlayerOptions() {
    this.players.forEach((val: Player) => {
      if (!this.options.find((val2: Option) => {
        return val.displayName === val2.name;
      })) {
        this.options.push({name: val.displayName});
      }
    });
  }
}
