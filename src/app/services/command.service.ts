import { Injectable } from '@angular/core';
import { ChatCommandType, GameActionType, ItemMessageType, MessageType } from '../model/WsData';
import { Player } from '../model/state/Player';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GameStateService } from './game-state.service';
import { ChatService } from './chat.service';
import { ItemService } from './item.service';
import { HintsService } from './hints.service';
import { GameComponent } from '../components/game/game.component';
import { ObjectLoaderService } from './object-loader.service';

export interface Command {
  cmd: string;
  /* rawCMD is the full text, parameters are the parameters, parsed by using space as delimiter.
     parameters[0] is therefore the command name */
  function: (rawCMD: string, parameters: string[]) => void;
  description: string;
  // command prototype to show in text
  prototype: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  readonly commandList: Command[] = [
    { cmd: '/help',
      function: this.printHelpCommand.bind(this),
      description: 'displays this help',
      prototype: '/help'},
    { cmd: '/ourAnthem',
      function: this.playAnthem.bind(this),
      description: 'play our anthem',
      prototype: '/ourAnthem'},
    { cmd: '/showLocalState',
      function: this.showLocalState.bind(this),
      description: 'show the local state',
      prototype: '/showLocalState'},
    { cmd: '/start',
      function: this.start.bind(this),
      description: 'force the start of the game. also resets the game',
      prototype: '/start'},
    { cmd: '/nextAction',
      function: this.advanceAction.bind(this),
      description: 'advance to the next action manually',
      prototype: '/nextAction'},
    { cmd: '/next',
      function: this.advanceTurn.bind(this),
      description: 'advance the turn manually',
      prototype: '/next'},
    { cmd: '/fps',
      function: this.toggleFpsDisplay.bind(this),
      description: 'toggle the FPS display',
      prototype: '/fps'},
    { cmd: '/addRule',
      function: this.addRule.bind(this),
      description: 'adds a Rule to the Ruleboard',
      prototype: '/addRule <Rule>'},
    { cmd: '/deleteRule',
      function: this.deleteRule.bind(this),
      description: 'deletes the rule with the given id(count from 0)',
      prototype: '/deleteRule <id>'},
    { cmd: '/dlScene',
      function: this.dlScene.bind(this),
      description: 'download the Scene as GLTF',
      prototype: '/dlScene'},
    { cmd: '/perspectiveChange',
      function: this.reverseTurnOrder.bind(this),
      description: 'Reverses the turn order',
      prototype: '/perspectiveChange'},
    { cmd: '/giveItem',
      function: this.giveItem.bind(this),
      description: 'Gives Player <name> <itemId>. Only the Host can do this.',
      prototype: '/giveItem <name> <itemId>'},
    { cmd: '/showItems',
      function: this.showItems.bind(this),
      description: 'List your currently owned Items',
      prototype: '/showItems'},
    { cmd: '/useItem',
      function: this.useItem.bind(this),
      description: 'Uses Item <itemId> [on Player <name>]. You need to have the Item in your Inventory.',
      prototype: '/useItem <itemId> <name?>'},
    { cmd: '/hint',
      function: this.printHint.bind(this),
      description: 'Gives a random hint',
      prototype: '/hint'},
    { cmd: '/respawn',
      function: this.respawn.bind(this),
      description: 'Respawn your figure',
      prototype: '/respawn'},
    { cmd: '/ask',
      function: this.askGame.bind(this),
      description: 'Ask the Game a Yes/No-Question',
      prototype: '/ask <Question>'},
    { cmd: '/random',
      function: this.randomNum.bind(this),
      description: 'get a random number between 1 and <number>',
      prototype: '/random <number>'},
    { cmd: '/coinflip',
      function: this.coinflip.bind(this),
      description: 'Flip a coin',
      prototype: '/coinflip'},
    { cmd: '/hires',
      function: this.objectLoader.loadHiResTex.bind(this.objectLoader),
      description: 'load the HiRes Textures',
      prototype: '/hires'}
    // TODO readd a feature alike this one. But add a new Player for this client instead
    /*{ cmd: '/addFigure',
      function: this.addGamefigure.bind(this),
      description: 'load the HiRes Textures',
      prototype: '/addFigure'}*/
  ];

  private gameComponent: GameComponent;

  constructor(private gameState: GameStateService,
              private chat: ChatService,
              private items: ItemService,
              private hints: HintsService,
              private objectLoader: ObjectLoaderService) { }

  registerGame(gameComponent: GameComponent) {
    this.gameComponent = gameComponent;
  }

  private print(msg: string, senderCmd: string) {
    this.chat.addLocalMessage(msg, 'Console: ' + senderCmd);
  }
  executeChatCommand(fullCommand: string) {
    const args = fullCommand.split(' ');
    const command = this.commandList.find(e => {
      return e.cmd.trim().toString() === args[0].trim().toString();
    });
    if (command !== undefined) {
      command.function(fullCommand, args);
    } else {
      console.log('Unknown command: ', args);
    }
  }

  private giveItem(rawCMD: string, parameters: string[]) {
    if (parameters.length < 3) {
      return;
    }
    const playerTag = parameters.slice(1, parameters.length - 1).join(' ');

    const sendGiveMessage = (playerLogin: string) => {
      const itemId: number = Number(parameters[parameters.length - 1]);
      this.print('Trying to give ' + playerLogin + ' Item ' + itemId, '/giveItem');
      this.gameState.sendMessage(MessageType.ITEM_MESSAGE, {
        type: MessageType.ITEM_MESSAGE,
        subType: ItemMessageType.giveItem,
        playerLoginName: playerLogin,
        itemId: itemId,
      });
    };

    // first try login names
    let targetPlayer: Player = this.gameState.getByLoginName(playerTag);
    // afterwards try display names
    if (targetPlayer === undefined) {
      targetPlayer = this.gameState.getByDisplayName(playerTag);
    }
    // send out
    if (targetPlayer !== undefined) {
      sendGiveMessage(targetPlayer.loginName);
    }
  }
  private showItems(rawCMD: string, parameters: string[]) {
    const myPlayer: Player = this.gameState.getMe();
    if (myPlayer !== undefined) {
      let list = '';
      myPlayer.itemList.forEach((value: number, key: string) => {
        if (value > 0) {
          if (list !== '') {
            list = list + '\r\n';
          }
          list = list + value + 'x ' + this.items.getItemName(Number(key)) + '(' + key + '): ' + this.items.getItemDesc(Number(key));
        }
      });
      if (list === '') {
        this.print('You have no Item', '/showItems');
      } else {
        this.print(list, '/showItems');
      }
    }
  }
  private useItem(rawCMD: string, parameters: string[]) {
    const sendUseMessage = (targetLogin: string) => {
      const itemId: number = Number(parameters[1]);
      this.print('Trying to use Item ' + itemId + ((targetLogin === '') ? '' : ' on ' + targetLogin), '/useItem');
      this.gameState.sendMessage(MessageType.ITEM_MESSAGE, {
        type: MessageType.ITEM_MESSAGE,
        subType: ItemMessageType.useItem,
        playerLoginName: this.gameState.getMyLoginName(),
        targetLoginName: targetLogin,
        itemId: itemId,
        param: '',
      });
    };
    if (parameters.length < 2) {
      return;
    } else if (parameters.length < 3) {
      sendUseMessage('');
    }
    const playerTag = parameters.slice(2).join(' ');

    // first try login names
    let targetPlayer: Player = this.gameState.getByLoginName(playerTag);
    // afterwards try display names
    if (targetPlayer === undefined) {
      targetPlayer = this.gameState.getByDisplayName(playerTag);
    }
    // send out
    if (targetPlayer !== undefined) {
      sendUseMessage(targetPlayer.loginName);
    }
  }
  private printHint(rawCMD: string, parameters: string[]): void {
    this.print('TIPP: ' + this.hints.getRandomHint(), '/hint');
  }
  private dlScene(rawCMD: string, parameters: string[]) {
    if (this.gameComponent !== undefined) {
      const exporter = new GLTFExporter();

      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link); // Firefox workaround, see #6594
      const save = (blob, filename) => {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        // URL.revokeObjectURL( url ); breaks Firefox...
      };

      // Parse the input and generate the glTF output
      exporter.parse(this.gameComponent.boardItemControl.scene, function (result) {
        console.log(result);
        if (result instanceof ArrayBuffer) {
          save(new Blob([result], {type: 'application/octet-stream'}), 'scene.glb');
        } else {
          const output = JSON.stringify(result, null, 2);
          console.log(output);
          save(new Blob([output], {type: 'text/plain'}), 'scene.gltf');

        }
      }, {});
    }
  }
  private respawn(rawCMD: string, parameters: string[]) {
    this.gameComponent.boardItemControl.respawnMyFigure();
  }
  private askGame(rawCMD: string, parameters: string[]) {
    const question = parameters.slice(1).join(' ');

    this.gameState.sendMessage(MessageType.CHAT_COMMAND, {
      type: MessageType.CHAT_COMMAND,
      subType: ChatCommandType.commandAsk,
      question: question,
      authorDisplayName: this.gameState.getMe().displayName
    });
  }
  private randomNum(rawCMD: string, parameters: string[]) {
    const limit: number = (parameters[1] !== undefined) ? Math.round(Number(parameters[1].trim())) : 10;
    this.gameState.sendMessage(MessageType.CHAT_COMMAND, {
      type: MessageType.CHAT_COMMAND,
      subType: ChatCommandType.commandRandom,
      limit: limit
    });
  }
  private coinflip(rawCMD: string, parameters: string[]) {
    this.gameState.sendMessage(MessageType.CHAT_COMMAND, {
      type: MessageType.CHAT_COMMAND,
      subType: ChatCommandType.commandCoinFlip
    });
  }
  private playAnthem(rawCMD: string, parameters: string[]) {
    if (this.gameComponent !== undefined) {
      this.gameComponent.audioCtrl.playAudio();
    }
  }
  private addRule(rawCMD: string, parameters: string[]) {
    console.log(parameters);
    const msgArray: any[] = parameters.slice(1);
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {
      type: MessageType.GAME_MESSAGE,
      action: GameActionType.addRule,
      text: msgArray.join(' ')
    });
  }
  private deleteRule(rawCMD: string, parameters: string[]) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE,
      {type: MessageType.GAME_MESSAGE, action: GameActionType.deleteRule, id: parameters[1]});
  }
  private showLocalState(rawCMD: string, parameters: string[]) {
    console.log(`State`, this.gameState.getState());
  }
  private advanceAction(rawCMD: string, parameters: string[]) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.advanceAction});
  }
  private advanceTurn(rawCMD: string, parameters: string[]) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.advanceTurn});
  }
  private reverseTurnOrder(rawCMD: string, parameters: string[]) {
    this.print('The Turn-Order was reversed!', '/perspectiveChange');
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.reverseTurnOrder});
  }
  private toggleFpsDisplay(rawCMD: string, parameters: string[]) {
    if (this.gameComponent !== undefined) {
      this.gameComponent.viewRef.stats.dom.hidden = !this.gameComponent.viewRef.stats.dom.hidden;
    }
  }
  private start(rawCMD: string, parameters: string[]) {
    this.gameState.sendMessage(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.setStartingCondition});
  }
  private printHelpCommand(rawCMD: string, parameters: string[]) {
    const commands: string[] = this.commandList.map(a => `${a.prototype} ${a.description}`);
    this.print(commands.join('\n'), '/help');
  }
}
