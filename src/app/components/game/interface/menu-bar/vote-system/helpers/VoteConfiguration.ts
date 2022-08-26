import { VoteEntry } from './VoteEntry';
import { ArraySchema, Schema, type } from '@colyseus/schema';

export class VoteConfiguration extends Schema {
  @type('string')
  author: string;

  @type('string')
  title: string;

  @type(['string'])
  ineligibles = new ArraySchema<string>();

  @type([VoteEntry])
  votingOptions: VoteEntry[];

  static build(title: string, author: string, eligibilities: Map<string, boolean>, options: VoteEntry[]): VoteConfiguration {
    const config = new VoteConfiguration();
    config.title = title;
    config.author = author;
    config.votingOptions = options;
    for (const k of eligibilities) {
      if (!k[1]) {
        config.ineligibles.push(k[0]);
      }
    }
    return config;
  }
}
