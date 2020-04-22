export type WsData = OtherMessage | ChatMessage | JoinMessage | GameMessage | PlayerMessage | PhysicsCommand | DebugCommand;
export enum MessageType {
  OTHER,
  CHAT_MESSAGE,
  JOIN_MESSAGE,
  LEFT_MESSAGE,
  GAME_MESSAGE,
  PLAYER_MESSAGE,
  PHYSICS_MESSAGE,
  DEBUG_COMMAND
}

export interface OtherMessage {
  type: MessageType.OTHER;
  message: string;
}
export interface ChatMessage {
  type: MessageType.CHAT_MESSAGE;
  message: string;
}
export interface JoinMessage {
  type: MessageType.JOIN_MESSAGE;
  message: string;
}
export interface LeftMessage {
  type: MessageType.LEFT_MESSAGE;
  message: string;
}

export enum GameActionType {
  none,
  addRule,
  deleteRule,
  advanceRound,
  advanceAction,
  advanceTurn,
  readyPopertyChange,
  setStartingCondition,
  setTile
}
export type GameMessage = GameAction | GameSetTile | GameAddRule | GameDeleteRule;
type actionTypes = GameActionType.none |
  GameActionType.advanceRound |
  GameActionType.advanceAction |
  GameActionType.advanceTurn |
  GameActionType.readyPopertyChange |
  GameActionType.setStartingCondition;
export interface GameAction {
  type: MessageType.GAME_MESSAGE;
  action: actionTypes;
}
export interface GameAddRule {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.addRule;
  text: string;
}
export interface GameDeleteRule {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.deleteRule;
  id: number;
}
export interface GameReadyProperty {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.readyPopertyChange;
  isReady: boolean;
}
export interface GameSetTile {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.setTile;
  figureId: number;
  playerId: string;
  tileId: number;
}
export type PlayerMessage = SetFigure;
export enum PlayerMessageType {
  setFigure
}
export interface SetFigure {
  type: MessageType.PLAYER_MESSAGE;
  subType: PlayerMessageType.setFigure;
  playerId: string;
  figureId: number;
  color: number;
}

export enum PhysicsCommandType {
  addEntity,
  remove,
  kinematic,
  position,
  quaternion,
  velocity,
  angularVelocity
}
export type PhysicsCommand = PhysicsCommandKinematic |
  PhysicsCommandRemove    |
  PhysicsCommandPosition  |
  PhysicsCommandQuat      |
  PhysicsCommandVelocity  |
  PhysicsCommandAngular   |
  PhysicsCommandAddEntity;
export enum PhysicsEntity {
  dice,
  figure
}
export enum PhysicsEntityVariation {
  default,
  procedural
}
export interface PhysicsCommandAddEntity {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.addEntity;
  physicsId: number;
  entity: PhysicsEntity;
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotW: number;
  color: number;
  variant: PhysicsEntityVariation;
}
export interface PhysicsCommandKinematic {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.kinematic;
  objectID: number;
  kinematic: boolean;
}
export interface PhysicsCommandRemove {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.remove;
  objectID: number;
}
export interface PhysicsCommandPosition {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.position;
  objectID: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}
export interface PhysicsCommandQuat {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.quaternion;
  objectID: number;
  quaternionX: number;
  quaternionY: number;
  quaternionZ: number;
  quaternionW: number;
}
export interface PhysicsCommandRemove {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.remove;
  objectID: number;
}
export interface PhysicsCommandPosition {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.position;
  objectID: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}
export interface PhysicsCommandQuat {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.quaternion;
  objectID: number;
  quaternionX: number;
  quaternionY: number;
  quaternionZ: number;
  quaternionW: number;
}
export interface PhysicsCommandVelocity {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.velocity;
  objectID: number;
  velX: number;
  velY: number;
  velZ: number;
}
export interface PhysicsCommandAngular {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.angularVelocity;
  objectID: number;
  angularX: number;
  angularY: number;
  angularZ: number;
}

export type DebugCommand = ListPhysics;
export enum DebugCommandType {
  listPhysics
}
export interface ListPhysics {
  type: MessageType.DEBUG_COMMAND;
  subType: DebugCommandType.listPhysics;
}
