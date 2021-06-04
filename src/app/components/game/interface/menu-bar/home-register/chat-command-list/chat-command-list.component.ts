import { Component, EventEmitter, Output } from '@angular/core';
import { Command, CommandService } from '../../../../../../services/command.service';

@Component({
  selector: 'app-chat-command-list',
  templateUrl: './chat-command-list.component.html',
  styleUrls: ['./chat-command-list.component.css'],
})
export class ChatCommandListComponent {
  @Output() selectCmdEmitter = new EventEmitter<Command>();

  constructor(public commandService: CommandService) {}

  selectCMD(c: Command): void {
    this.selectCmdEmitter.emit(c);
  }
}
