import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';

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
export class RoomComponent implements OnInit, OnDestroy {

  room: RoomModel = new RoomModel();
  timerStartingValue = 60;
  remainingTime: number;
  interval: number;
  private counter;

  constructor(private roomService: RoomService,
              private route: ActivatedRoute, private router: Router) { }

  // get room to which user has entered and set countdown to game begin
  ngOnInit() {
    this.remainingTime = this.timerStartingValue;

    this.roomService.getRoom()
      .subscribe(room => {
        this.room = room;
      });

    this.roomService.listenPort();
    // todo: add getting counter state from backend (add maybe 5 seconds on room state change)
    this.counter = of(this.countdown()).subscribe();
  }

  ngOnDestroy(): void {
    this.counter.unsubscribe();
  }

  leaveRoom() {
    this.roomService.leaveRoom()
      .subscribe(() => this.router.navigateByUrl(ViewModel.LOBBY));
  }

  // initialize timer, which count to game begin
  // it depends on number of users in room
  countdown() {
    this.interval = setInterval(() => {
      if (this.remainingTime > 0 && this.room.users.length > 1) {
        this.remainingTime--;
      } else if (this.remainingTime == 0) {
        // todo: remove when it'll be end on server side
        console.log('game start');
      } else {
        console.log('reset'); // todo: remove after testing on real data
        this.remainingTime = this.timerStartingValue;
      }
    }, 1000);

    return () => {
      clearInterval(this.interval);
    };
  }

  changeReadiness() {
    this.roomService.changeReadiness().subscribe();
    // to testing game-result-view
    // this.router.navigateByUrl('game/result');
  }

  gameView() {
    this.router.navigateByUrl('game/match');
  }

  areAllUsersReady(): boolean {
    return this.room.users.find(user => user.readyToGame === false) === undefined;
  }

}
