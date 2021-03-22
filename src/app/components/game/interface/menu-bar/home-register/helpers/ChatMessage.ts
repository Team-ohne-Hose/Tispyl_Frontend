export class ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;

  constructor(message: string, sender: string) {
    this.text = message;
    this.timestamp = new Date();
    this.sender = sender;
  }
}
