import { Schema, type } from '@colyseus/schema';

export class Rule extends Schema {
  @type('string')
  text: string;

  @type('string')
  author: string;

  constructor(text: string, author: string) {
    super();
    this.text = text;
    this.author = author;
  }
}
