import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChatMessage } from './helpers/ChatMessage';

import { Player } from '../../../../../model/state/Player';
import { ChatService } from '../../../../../services/chat.service';
import { Command, CommandService } from '../../../../../services/command.service';

@Component({
  selector: 'app-home-register',
  templateUrl: './home-register.component.html',
  styleUrls: ['./home-register.component.css'],
})
export class HomeRegisterComponent {
  @Input() playerlist: Player[];

  @ViewChild('textSection') textSection: ElementRef;
  @ViewChild('chatInput') chatInput: ElementRef;

  protected chatMessages: ChatMessage[] = [];
  protected showChatCmdDropdown = false;

  private commandHistory: string[] = [];
  private curCmdHistoryOffset = -1; // -1 means no selection has been made
  private readonly maxCmdHistory = 32;

  constructor(private chatService: ChatService, private commandService: CommandService) {
    this.chatMessages = this.chatService.getChatMessages();
    this.chatService.setMessageCallback(this.onChatMessage.bind(this));

    // scroll to bottom
    setTimeout(() => {
      const htmlNode = this.textSection.nativeElement;
      htmlNode.scrollTop = htmlNode.scrollHeight;
      this.chatInput.nativeElement.focus();
    }, 20);
  }

  sendChatMessageByKey(event: KeyboardEvent, inputField: HTMLInputElement): void {
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

  sendChatMessage(inputField: HTMLInputElement): void {
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

  onChatMessage(): void {
    this.chatMessages = this.chatService.getChatMessages();
    const htmlNode = this.textSection.nativeElement;
    setTimeout(() => {
      htmlNode.scrollTop = htmlNode.scrollHeight;
    }, 20);
  }

  executeCommand(cmdStr: string): void {
    this.commandService.executeChatCommand(cmdStr);
  }

  selectCmd(c: Command): void {
    console.log(`clicked on ${c.cmd}`);
    const nativeElem = this.chatInput.nativeElement;
    nativeElem.value = c.prototype;
    nativeElem.focus();
  }
}
