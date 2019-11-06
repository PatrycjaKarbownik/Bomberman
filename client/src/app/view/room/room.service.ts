import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { RoomModel } from '@app/view/room/models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor() { }

  getRoomById(id: number): Observable<RoomModel> {
    // todo: change to http request
    return of(this.rooms.find(it => it.id == id));
  }

  private rooms: RoomModel[] = [
    {
      id: 123,
      users: [{
        id: 1,
        username: 'Pati',
        readyToGame: true
      }, {
        id: 2,
        username: 'Tromba',
        readyToGame: false
      }, {
        id: 3,
        username: 'Mops',
        readyToGame: true
      }, {
        id: 4,
        username: 'Tadzik',
        readyToGame: true
      }]
    },
    {
      id: 234,
      users: [{
        id: 5,
        username: 'Kowal',
        readyToGame: false
      }, {
        id: 6,
        username: 'Piter',
        readyToGame: true
      }]
    },
    {
      id: 351,
      users: [{
        id: 7,
        username: 'Gracz1',
        readyToGame: false
      }, {
        id: 8,
        username: 'Gracz2',
        readyToGame: false
      }, {
        id: 9,
        username: 'Gracz3',
        readyToGame: false
      }]
    },
    {
      id: 666,
      users: [{
        id: 10,
        username: 'Monkey',
        readyToGame: true
      }, {
        id: 11,
        username: 'Pig',
        readyToGame: true
      }]
    }
  ];
}
