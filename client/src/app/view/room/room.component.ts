import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';

import { RoomService } from '@app/view/room/room.service';
import { RoomModel } from '@app/view/room/models/room.model';
import { ViewModel } from '@app/core/navigation/view.model';

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

  // get room to which user has entered and set countdown to game begin
  ngOnInit() {
    this.remainingTime = this.timerStartingValue;

    this.roomService.getRoom().subscribe(room => {
      this.room = room;
      this.numberOfUsers$.next(this.room.users.length);
    });
    // todo: add getting counter state from backend (add maybe 5 seconds on room state change)
    this.countdown();
  }

  leaveRoom() {
    this.roomService.leaveRoom()
      .subscribe(() => this.router.navigateByUrl(ViewModel.LOBBY));
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
