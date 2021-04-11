import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Command, CommandService } from '../../../../../../services/command.service';

@Component({
  selector: 'app-chat-command-list',
  templateUrl: './chat-command-list.component.html',
  styleUrls: ['./chat-command-list.component.css']
})
export class ChatCommandListComponent implements OnInit {

  @Output() selectCmdEmitter = new EventEmitter<Command>();

  constructor(public commandService: CommandService) { }

  ngOnInit(): void {
  }

  selectCMD(c: Command): void {
    this.selectCmdEmitter.emit(c);
  }

}
