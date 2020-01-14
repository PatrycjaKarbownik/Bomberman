import { MessageType } from '@app/view/game/server-connection/models/message-type';

export interface MessageModel {
  messageType: MessageType;
  content: any; // it hasn't specified type, because it depends on messageType
}
