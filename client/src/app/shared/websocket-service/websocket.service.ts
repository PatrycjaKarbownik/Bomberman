import { Injectable } from '@angular/core';
import { RoomModel } from '@app/view/room/models/room.model';
import { OverseerSocket } from '@app/shared/websocket-service/sockets/overseer-socket';
import { AccessToken } from '@app/core/storages/access-token.storage';
import { CurrentUserService } from '@app/shared/auth/current-user.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  overseerSocket = new OverseerSocket(this.currentUserService.getCurrentUserId());
  // messages = this.overseerSocket.fromEvent<string[]>('getMessages');
  room = this.overseerSocket.fromEvent<RoomModel>('room_state_changed');

  private counter = 1;

  constructor(private currentUserService: CurrentUserService) { }

  newMessage() {
    console.log(this.counter);
    this.overseerSocket.emit('sendMessage', {msg: `Test message ${this.counter}`});
    this.counter++;
  }
}
