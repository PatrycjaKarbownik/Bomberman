import { MessageType } from '@app/view/game/game-view/server-connection/message-type';

export interface MessageModel {
  messageType: MessageType;
  content: any; // it hasn't specified type, because it depends on messageType
}
