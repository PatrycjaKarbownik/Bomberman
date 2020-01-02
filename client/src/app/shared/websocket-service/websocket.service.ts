import { Injectable } from '@angular/core';

import { ReplaySubject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

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
  private gamehostSocket = webSocket('ws://192.168.0.121:5002');
  private roomState$ = this.overseerSocket.fromEvent<RoomModel>('room_state_changed');
  private lobbyState$ = this.overseerSocket.fromEvent<RoomWithUsernamesModel[]>('lobby_state_changed');

  room$ = new ReplaySubject<RoomModel>();
  lobby$ = new ReplaySubject<RoomWithUsernamesModel[]>();

  private counter = 1;

  constructor() {
    this.overseerConnect();

    this.lobbyState$.subscribe(lobbyState => {
      this.lobby$.next(lobbyState);
    });

    this.roomState$.subscribe(roomState => {
      this.room$.next(roomState);
    });
  }

  // todo: remove
  newMessage() {
    console.log(this.counter);
    this.gamehostSocket.next({msg: `Test message ${this.counter}`});
    this.counter++;
  }

  getGamehostSocket() {
    return this.gamehostSocket;
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
