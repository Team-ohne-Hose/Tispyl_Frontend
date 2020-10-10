import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../services/user.service';
import {FileService} from '../services/file.service';
import {ChatMessage} from './ChatMessage';
import {ObjectLoaderService} from '../services/object-loader.service';
import {MessageType, PlayerMessageType, SetFigure} from '../model/WsData';
import {GameStateService} from '../services/game-state.service';

@Component({
  selector: 'app-home-register',
  templateUrl: './home-register.component.html',
  styleUrls: ['./home-register.component.css']
})
export class HomeRegisterComponent implements OnInit {

  profileSource = '../assets/defaultImage.jpg';
  bottleCapSource = '../assets/models/otherTex/default.png';
  myBCapIndex = 1;

  @ViewChild('textSection') textSection: ElementRef;
  chatMessages: ChatMessage[] = [];

  constructor(private userManagement: UserService,
              private fileManagement: FileService,
              public gameState: GameStateService,
              private loader: ObjectLoaderService) {
    this.userManagement.getActiveUser().subscribe( u => {
      if ( u !== undefined ) {
        this.profileSource = this.fileManagement.profilePictureSource(u.login_name);
      }
    });
  }

  ngOnInit(): void {
    this.chatMessages = [
      new ChatMessage('Liebler stinkt!!', 'Kevin'),
      new ChatMessage('Garnicht :(', 'Liebler'),
      new ChatMessage('DOCH!!11!!Eins!!Elf!11!! ', 'Kevin'),
      new ChatMessage('LANGERTEXT DER MIR EIGENTLICH EGAL IST ICH MUSS NUR TESTEN WIE DAS MIT DEN ZEILEN UMBRÜCHEN AUSSIEHT =)', 'tiz')
    ];
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
    console.log('update bcap to', this.myBCapIndex);
    this.myBCapIndex++;
    if (this.myBCapIndex > this.loader.getBCapCount()) {
      this.myBCapIndex = 1;
    }
    console.log('update bcap to', this.myBCapIndex);
    this.bottleCapSource = this.loader.getBCapTextureThumbPath(this.myBCapIndex);

    const msg: SetFigure = {type: MessageType.PLAYER_MESSAGE,
      subType: PlayerMessageType.setFigure,
      playerId: this.gameState.getMyLoginName(),
      playerModel: this.myBCapIndex};
    this.gameState.sendMessage(MessageType.PLAYER_MESSAGE, msg);
  }
  prevBCap($event: Event) {
    console.log('update bcap to', this.myBCapIndex);
    this.myBCapIndex--;
    if (this.myBCapIndex < 1) {
      this.myBCapIndex = this.loader.getBCapCount();
    }
    console.log('update bcap to', this.myBCapIndex);
    this.bottleCapSource = this.loader.getBCapTextureThumbPath(this.myBCapIndex);

    const msg: SetFigure = {type: MessageType.PLAYER_MESSAGE,
      subType: PlayerMessageType.setFigure,
      playerId: this.gameState.getMyLoginName(),
      playerModel: this.myBCapIndex};
    this.gameState.sendMessage(MessageType.PLAYER_MESSAGE, msg);
  }
}
