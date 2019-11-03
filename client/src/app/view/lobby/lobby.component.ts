import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { RoomWithNicknamesModel } from '@app/view/lobby/models/room-with-nicknames.model';
import { LobbyService } from '@app/view/lobby/lobby.service';
import { ViewModel } from '@app/core/navigation/view.model';

// lobby component
// show rooms with users, give add and entry room options
@Component({
  selector: 'bomb-lobby',
  templateUrl: './lobby.component.pug',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  // room with users' nicknames only (we needn't other info about users)
  private rooms$: Observable<RoomWithNicknamesModel[]>;

  constructor(private lobbyService: LobbyService, private router: Router) { }

  // execute on create component
  // get rooms which will be shown on view
  ngOnInit() {
    this.rooms$ = this.lobbyService.getRooms();
  }

  navigateToRoom(id: number) {
    this.router.navigateByUrl(`${ViewModel.ROOM}/${id}`);
  }

  // creates room and navigate user to it
  createAndEntryRoom() {
    this.lobbyService.addRoom()
      .subscribe(response => this.navigateToRoom(response));
  }

}
