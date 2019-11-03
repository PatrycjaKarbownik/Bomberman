import { Injectable } from '@angular/core';
import { RoomModel } from '@app/view/lobby/models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor() { }

  getRoomById(id: number): RoomModel {
    // todo: change to http request
    return this.rooms.find(it => it.id === id);
  }

  private rooms: RoomModel[] = [
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
      id: 666,
      users: ['Monkey', 'Pig']
    }
  ];
}
