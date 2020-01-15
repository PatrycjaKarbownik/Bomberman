import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserResultModel } from '@app/view/game/server-connection/models/user-result.model';
import { ViewModel } from '@app/core/navigation/view.model';
import { Username } from '@app/core/storages/user-details.storage';
import { ServerConnectionService } from '@app/view/game/server-connection/server-connection.service';
import { UserActionService } from '@app/view/game/game-view/user-action.service';

@Component({
  selector: 'bomb-game-result',
  templateUrl: './game-result.component.pug',
  styleUrls: ['./game-result.component.scss']
})
export class GameResultComponent implements OnInit {
  @Username() private username: string;

  game_result: UserResultModel[];

  constructor(private serverConnectionService: ServerConnectionService, private userActionService: UserActionService,
              private router: Router) { }

  ngOnInit() {
    this.game_result = this.serverConnectionService.getGameResult();
    this.game_result.sort((a, b) => a.place - b.place);
  }

  returnToLobby() {
    this.userActionService.leaveRoom()
      .subscribe(() => this.router.navigateByUrl(ViewModel.LOBBY));
  }

  tryAgain() {
    // todo
    console.log('try again');
  }
}
