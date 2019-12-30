import { Injectable } from '@angular/core';

import { ReplaySubject } from 'rxjs';

import { RoomModel } from '@app/view/room/models/room.model';
import { OverseerSocket } from '@app/shared/websocket-service/sockets/overseer-socket';
import { UserId } from '@app/core/storages/user-details.storage';
import { RoomWithUsernamesModel } from '@app/view/lobby/models/room-with-usernames.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  @UserId() private userId: number;
  private overseerSocket = new OverseerSocket();
  private roomState$ = this.overseerSocket.fromEvent<RoomModel>('room_state_changed');
  private lobbyState$ = this.overseerSocket.fromEvent<RoomWithUsernamesModel[]>('lobby_state_changed');

  room$ = new ReplaySubject<RoomModel>();
  lobby$ = new ReplaySubject<RoomWithUsernamesModel[]>();

  private counter = 1;

  constructor() {
    console.log('websocket constructor');
    this.overseerConnect();

    this.lobbyState$.subscribe(lobbyState => {
      console.log('response', lobbyState);
      this.lobby$.next(lobbyState);
    });

    this.roomState$.subscribe(roomState => {
      console.log('response', roomState);
      this.room$.next(roomState);
    });
  }

  // todo: remove
  newMessage() {
    console.log(this.counter);
    this.overseerSocket.emit('sendMessage', {msg: `Test message ${this.counter}`});
    this.counter++;
  }

  overseerConnect() {
    this.overseerSocket.connect();
    this.overseerSocket.emit('authorize', this.userId);
  }

  overseerDisconnect() {
    console.log('disconnect');
    this.overseerSocket.disconnect();
  }
}
