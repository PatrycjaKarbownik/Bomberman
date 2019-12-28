import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { RoomModel } from '@app/view/room/models/room.model';
import { WebsocketService } from '@app/shared/websocket-service/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private static readonly roomUrl = 'room';

  room: RoomModel;

  constructor(private httpClient: HttpClient, private websocketService: WebsocketService) {
    /*websocketService.room.subscribe(response => {
      console.log('response', response);
      this.room = response;
      console.log('room', this.room);
    })*/
  }

  // gets details about room with sent id
  getRoomById(id: number): Observable<RoomModel> {
    return this.httpClient.get<RoomModel>(`${RoomService.roomUrl}/${id}`);
  }

  getRoom(): Observable<RoomModel> {
    return this.websocketService.room;
  }

  // gives possibility to leave room
  leaveRoom(): Observable<any> {
    return this.httpClient.put(`${RoomService.roomUrl}/leave`, null)
      .pipe(first());
  }
}
