import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { RoomWithUsernamesModel } from '@app/view/lobby/models/room-with-usernames.model';

// lobby service
// communicate with overseer
// send requests to overseer
@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor() { }

  getRooms(): Observable<RoomWithUsernamesModel[]> {
    // todo: change to websocket
    return of(this.rooms);
  }

  addRoom(): Observable<number> {
    // todo: change to http request
    return of(this.newRoom.id);
  }

  private newRoom: RoomWithUsernamesModel = {
    id: 666,
    users: ['Monkey', 'Pig']
  };

  private rooms: RoomWithUsernamesModel[] = [
    {
      id: 123,
      users: ['Pati', 'Tromba', 'Mops', 'Tadzik']
    },
    {
      id: 234,
      users: ['Kowal', 'Piter']
    },
    {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    },
    {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    },
    {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    },
    {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    },
    {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    }, {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    }, {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    }
  ];
}
