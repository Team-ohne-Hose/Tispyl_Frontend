import {VoteEntry} from './VoteEntry';


export class VoteResult {

  readonly title: string;
  readonly author: string;
  readonly entries: VoteEntry[];
  readonly ineligibles: string[];
  readonly timestamp: Date;

  constructor( title: string, author: string, options: VoteEntry[], ineligibles: string[] = [] ) {
    this.title = title;
    this.author = author;
    this.entries = options;
    this.ineligibles = ineligibles;
    this.timestamp = new Date();
  }
}
