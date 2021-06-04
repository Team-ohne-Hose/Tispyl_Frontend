import { Player } from '../../../../../../model/state/Player';
import { Schema, ArraySchema, type } from '@colyseus/schema';

export class VoteEntry extends Schema {
  @type('boolean')
  isPlayerEntry = false;

  @type('string')
  playerHandle: string = undefined;

  @type('string')
  text: string = undefined;

  @type(['string'])
  castVotes = new ArraySchema<string>();

  static fromPlayer(p: Player): VoteEntry {
    const entry = new VoteEntry();
    entry.isPlayerEntry = true;
    entry.playerHandle = p.loginName;
    entry.text = p.displayName;
    console.log('created: ', entry);
    return entry;
  }

  static fromObject(obj: VoteEntry): VoteEntry {
    const ve = new VoteEntry();
    ve.isPlayerEntry = obj.isPlayerEntry;
    ve.playerHandle = obj.playerHandle;
    ve.text = obj.text;
    obj.castVotes.map((v) => ve.castVotes.push(v));
    return ve;
  }
}
