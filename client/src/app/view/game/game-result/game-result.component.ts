import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserResultModel } from '@app/view/game/models/user-result.model';
import { ViewModel } from '@app/core/navigation/view.model';
import { Username } from '@app/core/storages/user-details.storage';

@Component({
  selector: 'bomb-game-result',
  templateUrl: './game-result.component.pug',
  styleUrls: ['./game-result.component.scss']
})
export class GameResultComponent implements OnInit {
  @Username() private username: string;

  game_result: UserResultModel[];

  constructor(private router: Router) { }

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

  returnToLobby() {
    this.router.navigateByUrl(ViewModel.LOBBY);
  }

  tryAgain() {
    // todo
    console.log('try again');
  }
}
