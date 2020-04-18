import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ChatWindowComponent} from './chat-window/chat-window.component';
import {ColyseusClientService} from '../services/colyseus-client.service';
import {Room} from 'colyseus.js';
import {GameState} from '../model/GameState';
import {Schema, DataChange} from '@colyseus/schema';


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
  currentState;

  @ViewChild('chat') chatRef: ChatWindowComponent;

  knownCommands: any[] = [
    {k: '/help', f: this.printHelpCommand.bind(this), h: ''},
    {k: '/showLocalState', f: this.showLocalState.bind(this), h: ''},
    {k: '/setLocalState', f: this.setLocalStateCommand.bind(this), h: 'name:string value:any'},
    {k: '/advanceRound', f: this.advanceRound.bind(this), h: ''},
    {k: '/advanceAction', f: this.advanceAction.bind(this), h: ''},
    {k: '/advanceTurn', f: this.advanceTurn.bind(this), h: ''},
    {k: '/start', f: this.start.bind(this), h: ''},
    {k: '/next', f: this.advanceAction.bind(this), h: ''},
    {k: '/enableDebugLog', f: this.enableDebugLogCommand.bind(this), h: ''}
  ];

  ngOnInit(): void {
    // This should be part of the colyseus service callback infrastructure
    this.colyseus.getActiveRoom().subscribe( room => {
      room.state.onChange = (changes: DataChange[]) => {
        changes.forEach(change => {
          console.log('ON_CHANGE', change);
          switch (change.field) {
            case 'round': { this.currentState.round = change.value; break; }
            case 'turn': { this.currentState.turn = change.value; break; }
            case 'action': { this.currentState.action = change.value; break; }
          }
        });
      };

      this.currentState = room.state;
    });
  }

  executeChatCommand( args ) {
    const command = this.knownCommands.find( e => {
      return e.k.trim().toString() === args[0].trim().toString();
    });
    if (command !== undefined) {
      command.f(args);
    } else {
      console.log('Unknown command: ', args);
    }
  }

  asArray(str: string): number[] {
    const arr: number[] = [];
    for (let i = 0; i < str.length; i++) {
      arr.push(str.charCodeAt(i));
    }
    return arr;
  }

  setLocalStateCommand( args ) {
    this.print(`Setting local state: ${args[1]} ${args[2]}`);
    this[args[1]] = args[2];
  }

  showLocalState( args ) {
    this.print(`State ${JSON.stringify(this.currentState)}`);
  }

  advanceRound( args ) {
    this.colyseus.getActiveRoom().subscribe( r => {
      r.send({type: 'ADVANCE_ROUND'});
    });
  }

  advanceAction( args ) {
    this.colyseus.getActiveRoom().subscribe( r => {
      r.send({type: 'ADVANCE_ACTION'});
    });
  }

  advanceTurn( args ) {
    this.colyseus.getActiveRoom().subscribe( r => {
      r.send({type: 'ADVANCE_TURN'});
    });
  }

  start( args ) {
    this.colyseus.getActiveRoom().subscribe( r => {
      r.send({type: 'SET_STARTING_CONDITIONS'});
    });
  }

  printHelpCommand( args ) {
    const commands: string[] = this.knownCommands.map( a => `${a.k} ${a.h}`);
    this.print(commands.join('\n'));
  }

  enableDebugLogCommand( scopedThis, args ) {
    this.print('already there');
  }

  print(msg: string) {
    this.chatRef.postChatMessage(msg);
  }


}
