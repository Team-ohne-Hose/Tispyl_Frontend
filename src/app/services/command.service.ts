import { Injectable } from '@angular/core';

export interface Command {
  cmd: string;
  /* fullCMD is the full text, parameters are the parameters, parsed by using space as delimiter.
     parameters[0] is therefore the command name */
  function: (fullCMD: string, parameters: string[]) => void;
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

  constructor() { }

  registerInterface() {

  }

  registerGame() {

  }
}
