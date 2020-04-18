import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ChatWindowComponent} from './chat-window/chat-window.component';
import {ColyseusClientService} from '../services/colyseus-client.service';
import {Room} from 'colyseus.js';
import {GameState} from '../model/GameState';

@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css']
})
export class InterfaceComponent implements OnInit {

  constructor(private router: Router, private colyseus: ColyseusClientService) {
    this.routes = router.config.filter( route => route.path !== '**' && route.path.length > 0);

  }

  routes;

  round = 0;
  turn = 'n/a';
  action = '';
  rules: string[] = [];

  @ViewChild('chat') chatRef: ChatWindowComponent;

  knownCommands: any[] = [
    {k: '/help', f: this.printHelpCommand, h: ''},
    {k: '/setLocalState', f: this.setLocalStateCommand, h: 'name:string value:any'},
    {k: '/advanceRound', f: this.advanceRound, h: ''},
    {k: '/enableDebugLog', f: this.enableDebugLogCommand, h: ''}
  ];

  ngOnInit(): void {
  }

  executeChatCommand( args ) {
    console.log('Parent: ', args);
    const command = this.knownCommands.find( e => {
      return e.k === args[0];
    }).f;
    if (command !== undefined) {
      command(this, args);
    } else {
      console.log('Unknown command: ', args);
    }
  }

  setLocalStateCommand( scopedThis, args ) {
    scopedThis.print('Setting local state: ', args[1], args[2]);
    scopedThis[args[1]] = args[2];
  }

  advanceRound( scopedThis, args ) {
    scopedThis.colyseus.getActiveRoom().subscribe( r => {
      r.send({type: 'ADVANCE_ROUND'});
    });
  }

  printHelpCommand( scopedThis, args ) {
    const commands: string[] = scopedThis.knownCommands.map( a => `${a.k} ${a.h}`);
    scopedThis.print(commands.join('\n'));
  }

  enableDebugLogCommand( scopedThis, args ) {
    scopedThis.colyseus.getActiveRoom().subscribe( room => {
      room.state.onChange = (changes) => {
        changes.forEach(change => {
          scopedThis.print(change.value);
          if (change.field === 'round') {
            scopedThis.print(change.value);
            scopedThis.round = change.value;
          }
        });
      };
    });
  }

  print(msg: string) {
    this.chatRef.chatContent =  this.chatRef.chatContent + '\n' + msg;
  }

}
