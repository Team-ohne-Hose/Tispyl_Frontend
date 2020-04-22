import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ChatWindowComponent} from './chat-window/chat-window.component';
import {ColyseusClientService} from '../services/colyseus-client.service';
import {DataChange, MapSchema} from '@colyseus/schema';
import {GameComponent} from '../game/game.component';
import {GameState} from '../model/GameState';
import {GameActionType, MessageType, PlayerMessageType, SetFigure} from '../model/WsData';
import {ObjectLoaderService} from '../services/object-loader.service';


@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css']
})
export class InterfaceComponent implements OnInit {

  constructor(private router: Router, private colyseus: ColyseusClientService, private loader: ObjectLoaderService) {
    this.routes = router.config.filter( route => route.path !== '**' && route.path.length > 0);
  }

  routes;
  currentState: GameState = new GameState();

  @Input() gameComponent: GameComponent;
  @ViewChild('chat') chatRef: ChatWindowComponent;

  knownCommands: any[] = [
    {k: '/help', f: this.printHelpCommand.bind(this), h: ''},
    {k: '/ourAnthem', f: this.playAnthem.bind(this), h: ''},
    // k: '/addFigure', f: this.addGamefigure.bind(this), h: ''}, TODO readd this feature
    {k: '/showLocalState', f: this.showLocalState.bind(this), h: ''},
    {k: '/start', f: this.start.bind(this), h: ''},
    {k: '/next', f: this.advanceAction.bind(this), h: ''},
    {k: '/fps', f: this.toggleFpsDisplay.bind(this), h: ''},
    {k: '/myTex', f: this.switchMyTex.bind(this), h: ''},
    {k: '/switchTex', f: this.switchTex.bind(this), h: ''}
  ];

  switchMyTex(args) {
    args[1] = Math.max(0, Math.min(Number(args[1]), 9));
    this.colyseus.getActiveRoom().subscribe( room => {
      const msg: SetFigure = {type: MessageType.PLAYER_MESSAGE,
        subType: PlayerMessageType.setFigure,
        playerId: this.colyseus.sessionId,
        playerModel: args[1]};
      room.send(msg);
    });
  }

  switchTex(args) {
    const obj = this.gameComponent.boardItemControl.scene.getObjectById(Number(args[1]));
    console.log('changing Tex of: ', Number(args[1]), obj);
    this.loader.switchTex(obj, args[2]);
  }

  ngOnInit(): void {
    this.colyseus.addOnChangeCallback((changes: DataChange[]) => {
      changes.forEach(change => {
        switch (change.field) {
          case 'round': { this.currentState.round = change.value; break; }
          case 'turn': { this.currentState.turn = change.value; break; }
          case 'action': { this.currentState.action = change.value; break; }
          case 'playerList': {this.currentState.playerList = change.value; break; }
        }
      });
    });

    this.colyseus.getActiveRoom().subscribe( room => {
      this.currentState = room.state || new GameState();
    });
  }

  private listPhysics() {
    this.colyseus.getActiveRoom().subscribe( room => {
      room.send({type: 'SERVER_COMMAND', content: {subType: 'listphysics'}});
    });
  }

  private playAnthem() {
    this.gameComponent.audioCtrl.playAudio.bind(this.gameComponent.audioCtrl)();
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

  private showLocalState( args ) {
    this.print(`State ${JSON.stringify(this.currentState)}`);
  }

  private advanceAction( args ) {
    this.colyseus.getActiveRoom().subscribe( r => {
      r.send({type: MessageType.GAME_MESSAGE, action: GameActionType.advanceAction});
    });
  }

  private toggleFpsDisplay( args ) {
    this.gameComponent.viewRef.stats.dom.hidden = !this.gameComponent.viewRef.stats.dom.hidden;
  }

  private start( args ) {
    this.colyseus.getActiveRoom().subscribe( r => {
      r.send({type: MessageType.GAME_MESSAGE, action: GameActionType.setStartingCondition});
    });
  }

  private printHelpCommand( args ) {
    const commands: string[] = this.knownCommands.map( a => `${a.k} ${a.h}`);
    this.print(commands.join('\n'));
  }

  print(msg: string) {
    this.chatRef.postChatMessage(msg);
  }

  asArray<T>(schema: MapSchema<T>): T[] {
    const tmpArray: T[] = [];
    for (const id in schema) {
      if (id in schema) {
        tmpArray.push(schema[id]);
      }
    }
    return tmpArray;
  }
}
