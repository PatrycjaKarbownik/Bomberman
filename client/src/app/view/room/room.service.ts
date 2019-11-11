import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { RoomModel } from '@app/view/room/models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private static readonly roomUrl = 'room';

  constructor(private httpClient: HttpClient) { }

  // gets details about room with sent id
  getRoomById(id: number): Observable<RoomModel> {
    return this.httpClient.get<RoomModel>(`${RoomService.roomUrl}/${id}`);
  }
}
