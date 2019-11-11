import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { RoomWithUsernamesModel } from '@app/view/lobby/models/room-with-usernames.model';

// lobby service
// communicate with overseer
// send requests to overseer
@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private static readonly roomUrl = 'room';

  constructor(private httpClient: HttpClient) { }

  // gets all rooms with their state and users (only usernames)
  getRooms(): Observable<RoomWithUsernamesModel[]> {
    // todo: change to websocket
    return this.httpClient.get<RoomWithUsernamesModel[]>(`${LobbyService.roomUrl}`)
      .pipe(first());
  }

  // adds new room and gets its id
  addRoom(): Observable<number> {
    return this.httpClient.post<number>(`${LobbyService.roomUrl}/add`, null)
      .pipe(first());
  }
}
