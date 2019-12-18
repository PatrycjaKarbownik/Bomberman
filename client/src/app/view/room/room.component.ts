import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RoomService } from '@app/view/room/room.service';
import { RoomModel } from '@app/view/room/models/room.model';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'bomb-room',
  templateUrl: './room.component.pug',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  room: RoomModel = new RoomModel();
  timerStartingValue = 60;
  remainingTime: number;
  interval: number;
  numberOfUsers$ = new ReplaySubject<number>();

  constructor(private roomService: RoomService,
              private route: ActivatedRoute, private router: Router) { }

  // get room to which user has entered
  ngOnInit() {
    this.remainingTime = this.timerStartingValue;

    this.roomService.getRoomById(this.route.snapshot.params.roomId)
      .subscribe(response => {
        this.room = response;
        this.numberOfUsers$.next(this.room.users.length);
        this.countdown();
      });
  }

  // initialize timer, which count to game begin
  // it depends on number of users in room
  // todo: add dependence on users' readiness
  countdown() {
    this.numberOfUsers$.subscribe(it => {
      this.interval = setInterval(() => {
        if (this.remainingTime > 0 && it > 1) {
          this.remainingTime--;
        } else if (this.remainingTime == 0) {
          // todo
          console.log('game start');
          clearInterval(this.interval);
        }
        else {
          console.log('reset'); // todo: remove after testing on real data
          this.remainingTime = this.timerStartingValue;
          clearInterval(this.interval);
        }
      }, 1000);
    });
  }

  reportReadiness() {
    // todo

    // to testing game-result-view
    this.router.navigateByUrl('game/result');
  }

}
