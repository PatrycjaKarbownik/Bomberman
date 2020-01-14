import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';

import { UserActionService } from '@app/view/game/game-view/user-action.service';
import { GameService } from '@app/view/game/game-view/game.service';
import { ServerConnectionService } from '@app/view/game/server-connection/server-connection.service';
import { Router } from '@angular/router';

// component with game
// inits game start and listens keyboard events
@Component({
  selector: 'bomb-match',
  template: `
    <div class="loader" [hidden]="!showLoader">
      <div class="message">
        <i class="fas fa-spinner fa-spin"></i>
        <h2>Loading</h2>
      </div>
    </div>
    <canvas #canvas class="canvas"></canvas>
  `,
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements AfterViewInit {

  @ViewChild('canvas') public canvas: ElementRef;
  showLoader = true;

  constructor(private userActionService: UserActionService, private gameService: GameService,
              private serverConnectionService: ServerConnectionService, private router: Router) {
    this.listenGameResult();
  }

  ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.gameService.createPlayground(canvasEl).then();
    this.serverConnectionService.getGameStartedEmitter()
      .subscribe(gameStarted => {
        this.showLoader = !(gameStarted === true);
        this.gameService.startGameLoop();
      });
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.userActionService.keyDown(event);
  }

  @HostListener('document:keyup', ['$event']) onKeyupHandler(event: KeyboardEvent) {
    this.userActionService.keyUp(event);
  }

  listenGameResult() {
    this.gameService.getGameResultPresentEmitter().subscribe(result => {
      if (result === true) {
        this.router.navigateByUrl('game/result');
      }
    })
  }
}
