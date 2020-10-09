import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../services/user.service';
import {FileService} from '../services/file.service';
import {ChatMessage} from '../home-register/ChatMessage';

@Component({
  selector: 'app-home-register',
  templateUrl: './home-register.component.html',
  styleUrls: ['./home-register.component.css']
})
export class HomeRegisterComponent implements OnInit {

  profileSource = '../assets/defaultImage.jpg';
  bottleCapSource = '../assets/models/otherTex/cocaCola.png';

  chatMessages: ChatMessage[] = [];

  constructor(private userManagement: UserService, private fileManagement: FileService) {
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
    }
  }


}
