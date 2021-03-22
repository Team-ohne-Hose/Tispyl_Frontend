export class GameLobby {

  name: string;
  author: string;
  creationDate: Date;
  roomId: string;
  playerCount: number;

  constructor(name: string, author: string, creationDate: Date, roomId: string, playerCount: number) {
    this.name = name;
    this.author = author;
    this.creationDate = creationDate;
    this.roomId = roomId;
    this.playerCount = playerCount;
  }
}
