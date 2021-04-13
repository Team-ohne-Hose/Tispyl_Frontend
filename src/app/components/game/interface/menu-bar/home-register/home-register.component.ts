import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { UserService, LoginUser } from '../../../../../services/user.service';
import { FileService } from '../../../../../services/file.service';
import { ChatMessage } from './helpers/ChatMessage';
import { ObjectLoaderService } from '../../../../../services/object-loader.service';
import {
  MessageType,
  PlayerMessageType,
  PlayerModel,
  RefreshCommandType,
  RefreshProfilePics,
  SetFigure
} from '../../../../../model/WsData';
import { GameStateService } from '../../../../../services/game-state.service';
import { Player } from '../../../../../model/state/Player';
import { ChatService } from '../../../../../services/chat.service';
import { Command, CommandService } from '../../../../../services/command.service';

@Component({
  selector: 'app-home-register',
  templateUrl: './home-register.component.html',
  styleUrls: ['./home-register.component.css']
})
export class HomeRegisterComponent {

  profileSource = '../assets/defaultImage.jpg';
  bottleCapSource = '../assets/models/otherTex/default.png';
  myBCapIndex = PlayerModel.bcap_NukaCola;

  user: LoginUser;
  myPlayer: Player;
  @Input() playerlist: Player[];

  @ViewChild('textSection') textSection: ElementRef;
  @ViewChild('chatInput') chatInput: ElementRef;
  chatMessages: ChatMessage[] = [];

  private commandHistory: String[] = [];
  private curCmdHistoryOffset = -1; // -1 means no selection has been made
  private readonly maxCmdHistory = 32;

  showChatCmdDropdown = false;

  constructor(private userManagement: UserService,
              private fileManagement: FileService,
              public gameState: GameStateService,
              private loader: ObjectLoaderService,
              private chatService: ChatService,
              private commandService: CommandService) {

    this.myPlayer = this.gameState.getMe();
    this.profileSource = this.fileManagement.profilePictureSource(this.myPlayer?.loginName) || '../assets/defaultImage.jpg';
    this.myBCapIndex = this.myPlayer.figureModel || PlayerModel.bcap_NukaCola;
    console.debug('Initialized bottle cap index to: ', this.myBCapIndex);
    this.bottleCapSource = this.loader.getBCapTextureThumbPath(this.myBCapIndex);

    this.userManagement.getActiveUser().subscribe(u => {
      this.user = u;
    });

    this.chatMessages = this.chatService.getChatMessages();
    this.chatService.setMessageCallback(this.onChatMessage.bind(this));

    // scroll to bottom
    setTimeout(() => {
      const htmlNode = this.textSection.nativeElement;
      htmlNode.scrollTop = htmlNode.scrollHeight;
      this.chatInput.nativeElement.focus();
    }, 20);
  }

  sendChatMessageByKey(event: KeyboardEvent, inputField: HTMLInputElement) {
    if (event.key === 'Enter') {
      this.sendChatMessage(inputField);
    } else if (event.key === 'ArrowUp') {
      this.curCmdHistoryOffset += 1;
      if (this.curCmdHistoryOffset < Math.min(this.maxCmdHistory, this.commandHistory.length)) {
        this.showCmdHistory(this.curCmdHistoryOffset);
      } else {
        this.curCmdHistoryOffset = Math.min(this.maxCmdHistory, this.commandHistory.length) - 1;
      }
    } else if (event.key === 'ArrowDown') {
      this.curCmdHistoryOffset -= 1;
      if (this.curCmdHistoryOffset >= -1) {
        this.showCmdHistory(this.curCmdHistoryOffset);
      } else {
        this.curCmdHistoryOffset = -1;
      }
    }
  }
  private showCmdHistory(cmdHistoryOffset: number) {
    const nativeElem = this.chatInput.nativeElement;
    nativeElem.value = cmdHistoryOffset < 0 ? '' : this.commandHistory[cmdHistoryOffset];
    nativeElem.focus();
  }

  sendChatMessage(inputField: HTMLInputElement) {
    this.curCmdHistoryOffset = -1;

    const userInput: string = String(inputField.value).trim();
    inputField.value = '';
    if (userInput !== '') {
      if (userInput.charAt(0) === '/') {
        // add to commandhistory
        this.commandHistory.unshift(userInput);
        if (this.commandHistory.length > this.maxCmdHistory) {
          this.commandHistory.pop();
        }

        // execute
        this.executeCommand(userInput);

      } else {
        this.chatService.sendMessage(String(userInput));
      }
    }
  }

  onChatMessage() {
    this.chatMessages = this.chatService.getChatMessages();
    const htmlNode = this.textSection.nativeElement;
    setTimeout(() => {
      htmlNode.scrollTop = htmlNode.scrollHeight;
    }, 20);
  }

  executeCommand(cmdStr: string) {
    this.commandService.executeChatCommand(cmdStr);
  }

  nextBCap($event: Event) {
    this.myBCapIndex++;
    if (this.myBCapIndex > this.loader.getBCapCount()) {
      this.myBCapIndex = 1;
    }
    this.setBCap();
  }

  prevBCap($event: Event) {
    this.myBCapIndex--;
    if (this.myBCapIndex < 1) {
      this.myBCapIndex = this.loader.getBCapCount();
    }
    this.setBCap();
  }

  getTimePlayed() {
    if (this.user !== undefined) {
      const min = this.user.time_played;
      return `${Math.floor(min / 60)} hours ${Math.floor(min % 60)} minutes`;
    } else {
      return '0 hours 0 minutes';
    }
  }

  getRole() {
    if (this.myPlayer === undefined) {
      return 'undefined';
    } else if (this.myPlayer.isCurrentHost) {
      return 'Host';
    } else if (this.user.is_dev) {
      return 'Dev';
    } else {
      return 'Player';
    }
  }

  newProfilePic(event) {
    const file = event.target.files[0];
    this.fileManagement.uploadProfilePicture(file, this.user).subscribe(suc => {
      console.log('Uploaded new profile picture: ', suc);
      this.profileSource = this.fileManagement.profilePictureSource(this.myPlayer.loginName, true);
      const msg: RefreshProfilePics = {
        type: MessageType.REFRESH_COMMAND,
        subType: RefreshCommandType.refreshProfilePic
      };
      this.gameState.sendMessage(MessageType.REFRESH_COMMAND, msg);
    });
  }

  private setBCap() {
    console.debug('Update bottle cap index to: ', this.myBCapIndex);
    this.bottleCapSource = this.loader.getBCapTextureThumbPath(this.myBCapIndex);

    const msg: SetFigure = {
      type: MessageType.PLAYER_MESSAGE,
      subType: PlayerMessageType.setFigure,
      playerId: this.gameState.getMyLoginName(),
      playerModel: this.myBCapIndex
    };
    this.gameState.sendMessage(MessageType.PLAYER_MESSAGE, msg);
  }

  selectCmd(c: Command) {
    console.log(`clicked on ${c.cmd}`);
    const nativeElem = this.chatInput.nativeElement;
    nativeElem.value = c.prototype;
    nativeElem.focus();
  }
}
