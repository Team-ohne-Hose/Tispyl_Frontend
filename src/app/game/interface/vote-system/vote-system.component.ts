import {Component, Input} from '@angular/core';
import {GameStateService} from '../../../services/game-state.service';
import {Player} from '../../../model/state/Player';
import {GameActionType, MessageType, WsData} from '../../../model/WsData';
import {ColyseusNotifyable} from '../../../services/game-initialisation.service';
import {FileService} from '../../../services/file.service';
import {MatChipInputEvent} from '@angular/material/chips';
import {Option} from '../../../debugdummy/debugdummy.component';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

enum VoteState {
  default,
  waiting,
  creating,
  voting,
  results
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
              const state = this.gameState.getState();
              if (state !== undefined && state.voteState.author !== this.gameState.getMyLoginName()) {
                this.showState = VoteState.waiting;
                console.log('vote is being created');
              } else {
                this.showState = VoteState.creating;
                console.log('create a vote!');
              }
              break;
            case GameActionType.openVote:
              console.log('start voting');
              this.showState = VoteState.voting;
              break;
            case GameActionType.closeVote:
              console.log('showing Results');
              this.showState = VoteState.results;
              break;
          }
        }
      }).bind(this), filterSubType: undefined});
  }

  attachColyseusStateCallbacks(): void {
    const state = this.gameState.getState();
    if (state !== undefined) {
      state.voteState.onChange((changes: DataChange[]) => {
        changes.forEach((change: DataChange) => {
          switch (change.field) {
            case 'author':
              if (change.value === undefined || change.value === '') {

              }
              break;
          }
        });
      });+
    }
  }

  toggleMove( ev ) {
    this.hidden = !this.hidden;
  }
  vote(loginName: string): void {
    this.gameState.sendMessage({type: MessageType.GAME_MESSAGE, action: GameActionType.playerVote, vote: loginName});
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
      action: GameActionType.startCreateVote
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

  getVotes(): number[] {
    const votes = [];
    const allVotes = this.gameState.getState().voteState.votes;
    for (const key in allVotes) {
      if (key in allVotes) {
        votes[allVotes[key].vote] = (votes[allVotes[key].vote] || 0) + 1;
      }
    }
    return votes;
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

    // Add our fruit
    if ((value || '').trim()) {
      this.options.push({name: value.trim()});
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
    console.log('toggle Player', p.loginName);
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
