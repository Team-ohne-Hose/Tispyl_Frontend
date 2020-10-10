import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ChatWindowComponent} from './chat-window/chat-window.component';
import {MapSchema} from '@colyseus/schema';
import {GameComponent} from '../game.component';
import {GameActionType, MessageType, PlayerMessageType, SetFigure} from '../../model/WsData';
import {Player} from '../../model/state/Player';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter';
import {GameStateService} from '../../services/game-state.service';
import {NextTurnButtonComponent} from './next-turn-button/next-turn-button.component';
import {TileOverlayComponent} from './tile-overlay/tile-overlay.component';
import {ColyseusNotifyable} from '../../services/game-initialisation.service';
import {TurnOverlayComponent} from './turn-overlay/turn-overlay.component';
import {HintsService} from '../../services/hints.service';
import {VoteSystemComponent} from './vote-system/vote-system.component';
import {ObjectLoaderService} from '../../services/object-loader.service';


@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css']
})
export class InterfaceComponent implements OnInit, ColyseusNotifyable {

  constructor(private router: Router,
              public gameState: GameStateService,
              private hints: HintsService,
              private loader: ObjectLoaderService) {
    this.routes = router.config.filter( route => route.path !== '**' && route.path.length > 0);
  }

  routes;
  gameComponent: GameComponent;

  @ViewChild('chat') chatRef: ChatWindowComponent;
  @ViewChild('nextTurn') nextTurnRef: NextTurnButtonComponent;
  @ViewChild('tileOverlay') tileOverlayRef: TileOverlayComponent;
  @ViewChild('turnOverlay') turnOverlayRef: TurnOverlayComponent;
  @ViewChild('voteSystem') voteSystemRef: VoteSystemComponent;

  knownCommands: any[] = [
    {k: '/help', f: this.printHelpCommand.bind(this), h: 'displays this help'},
    {k: '/ourAnthem', f: this.playAnthem.bind(this), h: 'play our anthem'},
    {k: '/showLocalState', f: this.showLocalState.bind(this), h: 'show the local state'},
    {k: '/start', f: this.start.bind(this), h: 'force the start of the game. also resets the game'},
    {k: '/nextAction', f: this.advanceAction.bind(this), h: 'advance to the next action manually'},
    {k: '/next', f: this.advanceTurn.bind(this), h: 'advance the turn manually'},
    {k: '/fps', f: this.toggleFpsDisplay.bind(this), h: 'toggle the FPS display'},
    {k: '/myTex', f: this.switchMyTex.bind(this), h: '<id> sets the skin to skin <id> (0-13)'},
    {k: '/addRule', f: this.addRule.bind(this), h: 'adds a Rule to the Ruleboard'},
    {k: '/deleteRule', f: this.deleteRule.bind(this), h: '<id> deletes the rule with id'},
    {k: '/dlScene', f: this.dlScene.bind(this), h: 'download the Scene as GLTF'},
    {k: '/perspectiveChange', f: this.reverseTurnOrder.bind(this), h: 'Reverses the turn order'},
    {k: '/hint', f: this.printHint.bind(this), h: 'Gives a random hint'}

    // {k: '/addFigure', f: this.addGamefigure.bind(this), h: ''},
    // TODO readd a feature alike this one. But add a new Player for this client instead
  ];

  attachColyseusStateCallbacks(): void {
    this.gameState.addNextTurnCallback((activePlayerLogin: string) => {
      this.turnOverlayRef.show();
    });
  }
  attachColyseusMessageCallbacks(): void {}

  private printHint(): void {
    this.print('TIPP: ' + this.hints.getRandomHint());
  }

  private dlScene() {
    if (this.gameComponent !== undefined) {
      const exporter = new GLTFExporter();

      const link = document.createElement( 'a' );
      link.style.display = 'none';
      document.body.appendChild( link ); // Firefox workaround, see #6594
      const save = ( blob, filename ) => {
        link.href = URL.createObjectURL( blob );
        link.download = filename;
        link.click();
        // URL.revokeObjectURL( url ); breaks Firefox...
      };

      // Parse the input and generate the glTF output
      exporter.parse( this.gameComponent.boardItemControl.scene, function ( result ) {
        console.log( result );
        if ( result instanceof ArrayBuffer ) {
          save( new Blob( [ result ], { type: 'application/octet-stream' } ), 'scene.glb' );
        } else {
          const output = JSON.stringify( result, null, 2 );
          console.log( output );
          save( new Blob( [ output ], { type: 'text/plain' } ), 'scene.gltf' );

        }
      }, {});
    }
  }

  switchMyTex(args) {
    /*args[1] = Math.max(0, Math.min(Number(args[1]), this.loader.getBCapCount()));
    const msg: SetFigure = {type: MessageType.PLAYER_MESSAGE,
      subType: PlayerMessageType.setFigure,
      playerId: this.gameState.getMyLoginName(),
      playerModel: args[1]};
    this.gameState.sendMessage(MessageType.PLAYER_MESSAGE, msg);*/
  }

  ngOnInit(): void {
  }

  private listPhysics() {
    this.gameState.sendMessage('SERVER_COMMAND', {type: 'SERVER_COMMAND', content: {subType: 'listphysics'}});
  }

  private playAnthem() {
    if (this.gameComponent !== undefined) {
      this.gameComponent.audioCtrl.playAudio();
    }
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

  private addRule( args ) {
    console.log(args);
    const msgArray: any[] = args.slice(1);
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.addRule, text: msgArray.join(' ')});
  }

  private deleteRule( args ) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.deleteRule, id: args[1]});
  }

  private showLocalState( args ) {
    console.log(`State`, this.gameState.getState() === undefined ? '' : this.gameState.getState());
  }

  private advanceAction( args ) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.advanceAction});
  }
  private advanceTurn( args ) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.advanceTurn});
  }

  private reverseTurnOrder( args ) {
    this.print('The Turn-Order was reversed!');
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.reverseTurnOrder});
  }

  private toggleFpsDisplay( args ) {
    if (this.gameComponent !== undefined) {
      this.gameComponent.viewRef.stats.dom.hidden = !this.gameComponent.viewRef.stats.dom.hidden;
    }
  }

  private start( args ) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.setStartingCondition});
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
  getDisplayName(login: string): string {
    const playerlist = this.gameState.getState() === undefined ? [] : this.gameState.getState().playerList;
    for (const key in playerlist) {
      if (key in playerlist) {
        const p: Player = playerlist[key];
        if (p.loginName === login) {
          return p.displayName;
        }
      }
    }
    return 'Login:' + login;
  }
}
