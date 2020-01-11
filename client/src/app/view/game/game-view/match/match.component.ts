import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';

import { ActionService } from '@app/view/game/game-view/action.service';
import { GameService } from '@app/view/game/game-view/game.service';

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

  constructor(private actionService: ActionService, private gameService: GameService) { }

  ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.actionService.createPlayGround(canvasEl);
    this.actionService.getImageLoadEmitter()
      .subscribe(() => {
        this.showLoader = false;
        this.gameService.startGameLoop()
      });
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.actionService.keyDown(event);
  }

  @HostListener('document:keyup', ['$event']) onKeyupHandler(event: KeyboardEvent) {
    this.actionService.keyUp(event);
  }
}
