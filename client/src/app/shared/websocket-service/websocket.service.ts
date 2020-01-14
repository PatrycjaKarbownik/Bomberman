import { Injectable } from '@angular/core';

import { ReplaySubject } from 'rxjs';

import { RoomModel } from '@app/view/room/models/room.model';
import { OverseerSocket } from '@app/shared/websocket-service/sockets/overseer-socket';
import { UserId } from '@app/core/storages/user-details.storage';
import { RoomWithUsernamesModel } from '@app/view/lobby/models/room-with-usernames.model';

// service for connection with overseer connection by websocket (socket-io)
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  @UserId() private userId: number;
  private overseerSocket = new OverseerSocket();
  private roomState$ = this.overseerSocket.fromEvent<RoomModel>('room_state_changed');
  private lobbyState$ = this.overseerSocket.fromEvent<RoomWithUsernamesModel[]>('lobby_state_changed');
  private portState$ = this.overseerSocket.fromEvent<number>('port_ready');

  room$ = new ReplaySubject<RoomModel>();
  lobby$ = new ReplaySubject<RoomWithUsernamesModel[]>();
  port$ = new ReplaySubject<number>();
  port: number;

  constructor() {
    this.overseerConnect();

    this.lobbyState$.subscribe(lobbyState => {
      this.lobby$.next(lobbyState);
    });

    this.roomState$.subscribe(roomState => {
      this.room$.next(roomState);
    });

    this.portState$.subscribe(portState => {
      this.port = portState;
      this.port$.next(portState);
    });
  }

  overseerConnect() {
    this.overseerSocket.connect();
    this.overseerSocket.emit('authorize', this.userId);
  }

  overseerDisconnect() {
    this.overseerSocket.disconnect();
  }
}
