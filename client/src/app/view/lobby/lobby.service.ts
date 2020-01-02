import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { RoomWithUsernamesModel } from '@app/view/lobby/models/room-with-usernames.model';
import { WebsocketService } from '@app/shared/websocket-service/websocket.service';

// lobby service
// communicate with overseer
// send requests to overseer
@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private static readonly roomUrl = 'room';

  constructor(private httpClient: HttpClient, private websocketService: WebsocketService) { }

  // gets all rooms with their state and users (only usernames) received from server via websocket
  getRooms(): ReplaySubject<RoomWithUsernamesModel[]> {
    return this.websocketService.lobby$;
  }

  // adds new room and gets its id
  addRoom(): Observable<number> {
    return this.httpClient.post<number>(`${LobbyService.roomUrl}/add`, null)
      .pipe(first());
  }

  // gives possibility to enter room with specific id
  enterRoom(id: number): Observable<any> {
    return this.httpClient.put(`${LobbyService.roomUrl}/enter/${id}`, null)
      .pipe(first());
  }
}
