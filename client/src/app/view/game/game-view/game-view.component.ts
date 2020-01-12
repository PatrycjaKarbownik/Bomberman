import { Component, OnInit } from '@angular/core';
import { GameDetailsService } from '@app/view/game/game-view/game-details.service';

@Component({
  selector: 'bomb-game-view',
  template: `
    <div class="col-sm-12 py-4 d-flex flex-column align-items-center">
      <div class="map">
        <bomb-match></bomb-match>
      </div>
      <button class="ml-5 button-primary" (click)="sendMsg()">SEND</button>
    </div>
  `,
  styleUrls: ['./game-view.component.scss']
})
export class GameViewComponent implements OnInit {

  constructor(private gameDetailsService: GameDetailsService) { }

  ngOnInit() { }

  sendMsg() {
    this.gameDetailsService.newMessage();
  }
}
