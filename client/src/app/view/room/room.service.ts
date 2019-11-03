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
        nickname: 'Pati',
        readyToGame: true
      }, {
        id: 2,
        nickname: 'Tromba',
        readyToGame: false
      }, {
        id: 3,
        nickname: 'Mops',
        readyToGame: true
      }, {
        id: 4,
        nickname: 'Tadzik',
        readyToGame: true
      }]
    },
    {
      id: 234,
      users: [{
        id: 5,
        nickname: 'Kowal',
        readyToGame: false
      }, {
        id: 6,
        nickname: 'Piter',
        readyToGame: true
      }]
    },
    {
      id: 351,
      users: [{
        id: 7,
        nickname: 'Gracz1',
        readyToGame: false
      }, {
        id: 8,
        nickname: 'Gracz2',
        readyToGame: false
      }, {
        id: 9,
        nickname: 'Gracz3',
        readyToGame: false
      }]
    },
    {
      id: 666,
      users: [{
        id: 10,
        nickname: 'Monkey',
        readyToGame: true
      }, {
        id: 11,
        nickname: 'Pig',
        readyToGame: true
      }]
    }
  ];
}
