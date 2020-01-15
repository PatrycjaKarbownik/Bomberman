import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { RoomModel } from '@app/view/room/models/room.model';
import { WebsocketService } from '@app/shared/websocket-service/websocket.service';

// room service
// communicate with overseer
// send requests to overseer
// requests relate only specified room info
@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private static readonly roomUrl = 'room';
  private static readonly userUrl = 'user';

  constructor(private httpClient: HttpClient, private websocketService: WebsocketService, private router: Router) { }

  // gets details about room received from server via websocket
  getRoom(): ReplaySubject<RoomModel> {
    return this.websocketService.room$;
  }

  // when server sends port on which game will be play, navigate to match view
  listenPort() {
    return this.websocketService.port$
      .subscribe(port => this.router.navigateByUrl('game/match'));
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
