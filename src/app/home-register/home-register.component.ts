import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../services/user.service';
import {FileService} from '../services/file.service';
import {ChatMessage} from './ChatMessage';
import {ObjectLoaderService} from '../services/object-loader.service';
import {MessageType, PlayerMessageType, RefreshCommandType, RefreshProfilePics, SetFigure} from '../model/WsData';
import {GameStateService} from '../services/game-state.service';
import {User} from '../model/User';
import {Player} from '../model/state/Player';

@Component({
  selector: 'app-home-register',
  templateUrl: './home-register.component.html',
  styleUrls: ['./home-register.component.css']
})
export class HomeRegisterComponent implements OnInit {

  profileSource = '../assets/defaultImage.jpg';
  bottleCapSource = '../assets/models/otherTex/default.png';
  myBCapIndex = 1;

  user: User;
  @Input() playerlist: Player[];

  @ViewChild('textSection') textSection: ElementRef;
  chatMessages: ChatMessage[] = [];

  constructor(private userManagement: UserService,
              private fileManagement: FileService,
              public gameState: GameStateService,
              private loader: ObjectLoaderService) {
    this.userManagement.getActiveUser().subscribe( u => {
      if ( u !== undefined ) {
        this.user = u;
        this.profileSource = this.fileManagement.profilePictureSource(u.login_name);
      } else {
        console.error('couldnt get user entry');
      }
    });
  }

  ngOnInit(): void {
    const p = this.getPlayerFromUser(this.user);
    if (p !== undefined) {
      this.myBCapIndex = p.figureModel || 1;
      console.debug('init bcap to', this.myBCapIndex);
      this.bottleCapSource = this.loader.getBCapTextureThumbPath(this.myBCapIndex);
    } else {
      console.error('couldnt get player entry', this.playerlist);
    }
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
      this.chatMessages.push(new ChatMessage(String(userInput), 'tiz'));
      const htmlNode = this.textSection.nativeElement;
      setTimeout( () => { htmlNode.scrollTop = htmlNode.scrollHeight; }, 20);
    }
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
    console.debug('update bcap to', this.myBCapIndex);
    this.bottleCapSource = this.loader.getBCapTextureThumbPath(this.myBCapIndex);

    const msg: SetFigure = {type: MessageType.PLAYER_MESSAGE,
      subType: PlayerMessageType.setFigure,
      playerId: this.gameState.getMyLoginName(),
      playerModel: this.myBCapIndex};
    this.gameState.sendMessage(MessageType.PLAYER_MESSAGE, msg);
  }

  getTimePlayed() {
    const min = this.user.time_played;
    return `${Math.floor(min / 60)} hours ${Math.floor(min % 60)} minutes`;
  }
  getRole() {
    const p = this.getPlayerFromUser(this.user);
    if (p === undefined) {
    } else if (p.isCurrentHost) {
      return 'Host';
    } else if (this.user.is_dev) {
      return 'Dev';
    } else {
      return 'Player';
    }
    return 'undefined';
  }
  getPlayerFromUser(user: User): Player {
    const p = this.playerlist ? this.playerlist.find((val: Player) => {
      return val.loginName === user.login_name;
    }) : undefined;
    return p;
  }
  newProfilePic(event) {
    const file = event.target.files[0];
    this.fileManagement.uploadProfilePicture(file, this.user).subscribe(suc => {
      console.log('tried uploading new profile picture', suc);
      this.profileSource = this.fileManagement.profilePictureSource(this.user.login_name);
      const msg: RefreshProfilePics = {type: MessageType.REFRESH_COMMAND,
        subType: RefreshCommandType.refreshProfilePic};
      this.gameState.sendMessage(MessageType.REFRESH_COMMAND, msg);
    });
  }
}
