import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RoomService } from '@app/view/room/room.service';
import { RoomModel } from '@app/view/room/models/room.model';
import { ViewModel } from '@app/core/navigation/view.model';

// room component
// show users in room and their statuses - ready to game or not
// give change readiness and leave room options
@Component({
  selector: 'bomb-room',
  templateUrl: './room.component.pug',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  room: RoomModel = new RoomModel();

  constructor(private roomService: RoomService,
              private route: ActivatedRoute, private router: Router) { }

  // get room to which user has entered and set countdown to game begin
  ngOnInit() {
    this.roomService.getRoom()
      .subscribe(room => {
        this.room = room;
      });

    this.roomService.listenPort();
  }

  leaveRoom() {
    this.roomService.leaveRoom()
      .subscribe(() => this.router.navigateByUrl(ViewModel.LOBBY));
  }

  changeReadiness() {
    this.roomService.changeReadiness().subscribe();
    // to testing game-result-view
    // this.router.navigateByUrl('game/result');
  }

  areAllUsersReady(): boolean {
    return this.room.users.find(user => user.readyToGame === false) === undefined;
  }

}
