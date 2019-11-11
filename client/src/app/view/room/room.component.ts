import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RoomService } from '@app/view/room/room.service';
import { RoomModel } from '@app/view/room/models/room.model';

@Component({
  selector: 'bomb-room',
  templateUrl: './room.component.pug',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  roomId: number;
  room: RoomModel = new RoomModel();
  remainingTime: number;

  constructor(private roomService: RoomService,
              private route: ActivatedRoute) { }

  // get room to which user has entered
  ngOnInit() {
    this.roomId = this.route.snapshot.params.roomId;
    this.remainingTime = 60;
    this.roomService.getRoomById(this.roomId)
      .subscribe(response => {
        this.room = response;
      });
  }

}
