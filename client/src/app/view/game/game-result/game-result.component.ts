import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserResultModel } from '@app/view/game/models/user-result.model';
import { CurrentUserModel } from '@app/shared/auth/current-user.model';
import { CurrentUserService } from '@app/shared/auth/current-user.service';
import { ViewModel } from '@app/core/navigation/view.model';

@Component({
  selector: 'bomb-game-result',
  templateUrl: './game-result.component.pug',
  styleUrls: ['./game-result.component.scss']
})
export class GameResultComponent implements OnInit {
  game_result: UserResultModel[];

  constructor(private currentUserService: CurrentUserService,
              private router: Router) { }

  ngOnInit() {
    // todo: get game result
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
  }

  getUsername(): Observable<CurrentUserModel> {
    return this.currentUserService.getCurrentUser();
  }

  returnToLobby() {
    this.router.navigateByUrl(ViewModel.LOBBY);
  }

  tryAgain() {
    // todo
    console.log('try again');
  }
}
