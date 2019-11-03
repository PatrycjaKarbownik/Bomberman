import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { RoomModel } from '@app/view/lobby/models/room.model';
import { LobbyService } from '@app/view/lobby/lobby.service';

// lobby component
// show rooms with users, give add and entry room options
@Component({
  selector: 'bomb-lobby',
  templateUrl: './lobby.component.pug',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  private rooms$: Observable<RoomModel[]>;
  constructor(private lobbyService: LobbyService) { }

  // get rooms which will be shown on view
  ngOnInit() {
    this.rooms$ = this.lobbyService.getRooms();
  }

}
