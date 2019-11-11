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

  room: RoomModel = new RoomModel();
  remainingTime: number;

  constructor(private roomService: RoomService,
              private route: ActivatedRoute) { }

  // get room to which user has entered
  ngOnInit() {
    this.remainingTime = 60;
    this.roomService.getRoomById(this.route.snapshot.params.roomId)
      .subscribe(response => {
        this.room = response;
      });
  }

}
