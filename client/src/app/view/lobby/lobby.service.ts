import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { RoomWithNicknamesModel } from '@app/view/lobby/models/room-with-nicknames.model';

// lobby service
// communicate with overseer
// send requests to overseer
@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor() { }

  getRooms(): Observable<RoomWithNicknamesModel[]> {
    // todo: change to websocket
    return of(this.rooms);
  }

  addRoom(): Observable<number> {
    // todo: change to http request
    return of(this.newRoom.id);
  }

  private newRoom: RoomWithNicknamesModel = {
    id: 666,
    users: ['Monkey', 'Pig']
  };

  private rooms: RoomWithNicknamesModel[] = [
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
    }, {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    }, {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    }, {
      id: 351,
      users: ['Gracz1', 'Gracz2', 'Gracz3']
    }, {
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
    }
  ];
}
