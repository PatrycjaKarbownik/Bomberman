import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RoomWithUsernamesModel } from '@app/view/lobby/models/room-with-usernames.model';
import { LobbyService } from '@app/view/lobby/lobby.service';
import { ViewModel } from '@app/core/navigation/view.model';
import { WebsocketService } from '@app/shared/websocket-service/websocket.service';

// lobby component
// show rooms with users, give add and entry room options
@Component({
  selector: 'bomb-lobby',
  templateUrl: './lobby.component.pug',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  private readonly maxUsersInRoom = 4;

  // room with users' nicknames only (we needn't other info about users)
  private rooms: RoomWithUsernamesModel[];

  constructor(private lobbyService: LobbyService,
              private websocketService: WebsocketService, private router: Router) { }

  // executes on create component
  // gets rooms which will be shown on view
  ngOnInit() {
    this.lobbyService.getRooms().subscribe(rooms =>
      this.rooms = rooms);
    this.websocketService.getGamehostSocket().asObservable().subscribe(data => console.log(data));
  }

  // creates room and navigate user to it
  createAndEnterRoom() {
    this.lobbyService.addRoom()
      .subscribe(response => this.enterRoom(response));
  }

  enterRoom(id: number) {
    this.lobbyService.enterRoom(id)
      .subscribe(response => {
        this.navigateToRoom(id);
      })
  }

  private navigateToRoom(id: number) {
    this.router.navigateByUrl(`${ViewModel.ROOM}/${id}`);
  }

  sendMsg() {
    this.websocketService.newMessage();
  }
}
