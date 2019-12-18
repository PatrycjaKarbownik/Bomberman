import { Component, OnInit } from '@angular/core';
import { UserResultModel } from '@app/view/game/models/user-result.model';
import { Observable } from 'rxjs';
import { CurrentUserModel } from '@app/shared/auth/current-user.model';
import { CurrentUserService } from '@app/shared/auth/current-user.service';

@Component({
  selector: 'bomb-game-result',
  templateUrl: './game-result.component.pug',
  styleUrls: ['./game-result.component.scss']
})
export class GameResultComponent implements OnInit {
  game_result: UserResultModel[];

  constructor(private currentUserService: CurrentUserService) { }

  ngOnInit() {
    this.game_result = [
      {
        username: 'xxWyGryWxxx',
        place: 3
      },
      {
        username: 'Patrice44',
        place: 1
      },
      {
        username: 'Keke',
        place: 2
      }
    ];

    this.game_result.sort((a, b) => a.place - b.place);
    console.log(this.game_result);
  }

  getUsername(): Observable<CurrentUserModel> {
    return this.currentUserService.getCurrentUser();
  }

}
