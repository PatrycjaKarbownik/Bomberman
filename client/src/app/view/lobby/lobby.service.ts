import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { RoomModel } from '@app/view/lobby/models/room.model';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor() { }

  getRooms(): Observable<RoomModel[]> {
    return of([
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
    ]);
  }
}
