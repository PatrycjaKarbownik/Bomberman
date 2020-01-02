import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { RoomModel } from '@app/view/room/models/room.model';
import { WebsocketService } from '@app/shared/websocket-service/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private static readonly roomUrl = 'room';
  private static readonly userUrl = 'user';

  constructor(private httpClient: HttpClient, private websocketService: WebsocketService) { }

  // gets details about room received from server via websocket
  getRoom(): ReplaySubject<RoomModel> {
    return this.websocketService.room$;
  }

  // gives possibility to leave room
  leaveRoom(): Observable<any> {
    return this.httpClient.put(`${RoomService.roomUrl}/leave`, null)
      .pipe(first());
  }

  // gives possibility to change readiness (if user is ready, this request changes his readiness to not ready, and reversely)
  changeReadiness(): Observable<any> {
    return this.httpClient.put(`${RoomService.userUrl}/change-readiness`, null)
      .pipe(first());
  }
}
