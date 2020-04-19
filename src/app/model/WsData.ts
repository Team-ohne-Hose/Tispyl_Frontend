
export type WsData = ChatMessage;

enum MessageType {
  CHAT_MESSAGE,
  GAME_MESSAGE,
  OTHER
}

export interface ChatMessage {
  type: MessageType.CHAT_MESSAGE;
  message: string;
}

export enum PhysicsCommandType {
  create,
  remove,
  kinematic,
  position,
  quaternion,
  velocity,
  angularVelocity
}
export interface PhysicsCommand {
  subType: PhysicsCommandType;
  objectID: number;
  kinematic: boolean;
  geo: ArrayLike<number>;
  mass: number;
  colGroup: number;
  colMask: number;
  behavior: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  quaternionX: number;
  quaternionY: number;
  quaternionZ: number;
  quaternionW: number;
  velX: number;
  velY: number;
  velZ: number;
  angularX: number;
  angularY: number;
  angularZ: number;
}




