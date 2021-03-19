import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {UserService} from '../services/user.service';
import {FileService} from '../services/file.service';
import {ChatMessage} from './ChatMessage';
import {ObjectLoaderService} from '../services/object-loader.service';
import {MessageType, PlayerMessageType, RefreshCommandType, RefreshProfilePics, SetFigure} from '../model/WsData';
import {GameStateService} from '../services/game-state.service';
import {LoginUser, User} from '../model/User';
import {Player} from '../model/state/Player';
import {ChatService} from '../services/chat.service';

@Component({
  selector: 'app-home-register',
  templateUrl: './home-register.component.html',
  styleUrls: ['./home-register.component.css']
})
export class HomeRegisterComponent {

  profileSource = '../assets/defaultImage.jpg';
  bottleCapSource = '../assets/models/otherTex/default.png';
  myBCapIndex = 1;

  user: LoginUser;
  myPlayer: Player;
  @Input() playerlist: Player[];
  @Output() chatCommand = new EventEmitter<string[]>();

  @ViewChild('textSection') textSection: ElementRef;
  chatMessages: ChatMessage[] = [];

  constructor(private userManagement: UserService,
              private fileManagement: FileService,
              public gameState: GameStateService,
              private loader: ObjectLoaderService,
              private chatService: ChatService) {

    this.myPlayer = this.gameState.getMe();
    this.profileSource = this.fileManagement.profilePictureSource(this.myPlayer?.loginName) || '../assets/defaultImage.jpg';
    this.myBCapIndex = this.myPlayer.figureModel || 1;
    console.debug('Initialized bottle cap index to: ', this.myBCapIndex);
    this.bottleCapSource = this.loader.getBCapTextureThumbPath(this.myBCapIndex);

    this.userManagement.getActiveUser().subscribe( u => {
      this.user = u;
    });

    this.chatMessages = this.chatService.getChatMessages();
    this.chatService.setMessageCallback(this.onChatMessage.bind(this));

    // scroll to bottom
    setTimeout( () => {
      const htmlNode = this.textSection.nativeElement;
      htmlNode.scrollTop = htmlNode.scrollHeight;
    }, 20);
  }

  sendChatMessageByKey(event: KeyboardEvent, inputField: HTMLInputElement) {
    if (event.code === 'Enter') {
      this.sendChatMessage(inputField);
    }
  }

  sendChatMessage(inputField: HTMLInputElement) {
    const userInput: String = String(inputField.value).trim();
    inputField.value = '';
    if (userInput !== '') {
      if (userInput.charAt(0) === '/') {
        this.executeCommand(userInput.substring(1));
      } else {
        this.chatService.sendMessage(String(userInput));
      }
    }
  }

  onChatMessage() {
    this.chatMessages = this.chatService.getChatMessages();
    const htmlNode = this.textSection.nativeElement;
    setTimeout( () => { htmlNode.scrollTop = htmlNode.scrollHeight; }, 20);
  }

  executeCommand(cmdStr: string) {
    const args = cmdStr.split(' ');
    this.chatCommand.emit(args);
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

  private setBCap() {
    console.debug('Update bottle cap index to: ', this.myBCapIndex);
    this.bottleCapSource = this.loader.getBCapTextureThumbPath(this.myBCapIndex);

    const msg: SetFigure = {type: MessageType.PLAYER_MESSAGE,
      subType: PlayerMessageType.setFigure,
      playerId: this.gameState.getMyLoginName(),
      playerModel: this.myBCapIndex};
    this.gameState.sendMessage(MessageType.PLAYER_MESSAGE, msg);
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
      const msg: RefreshProfilePics = {type: MessageType.REFRESH_COMMAND,
        subType: RefreshCommandType.refreshProfilePic};
      this.gameState.sendMessage(MessageType.REFRESH_COMMAND, msg);
    });
  }
}
