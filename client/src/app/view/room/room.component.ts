import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'bomb-room',
  templateUrl: './room.component.pug',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  roomId: number;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.roomId = this.route.snapshot.params.roomId;
  }

}
