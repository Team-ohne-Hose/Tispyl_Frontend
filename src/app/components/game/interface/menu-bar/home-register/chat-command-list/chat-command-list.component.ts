import { Component, OnInit } from '@angular/core';
import { Command, CommandService } from '../../../../../../services/command.service';

@Component({
  selector: 'app-chat-command-list',
  templateUrl: './chat-command-list.component.html',
  styleUrls: ['./chat-command-list.component.css']
})
export class ChatCommandListComponent implements OnInit {

  constructor(public commandService: CommandService) { }

  ngOnInit(): void {
  }

  selectCMD(c: Command): void {
    console.log(`clicked on ${c.cmd}`);
  }

}
