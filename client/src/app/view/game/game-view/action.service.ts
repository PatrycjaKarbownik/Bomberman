import { EventEmitter, Injectable } from '@angular/core';

import { GameService } from '@app/view/game/game-view/game.service';
import { Configuration } from '@app/view/game/game-view/models/configuration';

@Injectable({
  providedIn: 'root'
})
export class ActionService {

  private isImageLoaded: EventEmitter<number> = new EventEmitter();

  constructor(private gameService: GameService, private configuration: Configuration) { }

  createPlayGround(canvasElement): void {
    this.gameService.loadAssets(canvasElement).then(() => {
      setTimeout( () =>{
        this.isImageLoaded.emit();
      },1000);
    });
  }

  getImageLoadEmitter() {
    return this.isImageLoaded;
  }

  keyDown(event: KeyboardEvent): void {
    if(event.code === this.configuration.keyboardsSettings.placeBomb) {
      this.gameService.setBomb();
    }
    if(event.code === this.configuration.keyboardsSettings.up) {
      this.gameService.up = true;
      this.gameService.down = false;
      this.gameService.left = false;
      this.gameService.right = false;
    } else if(event.code === this.configuration.keyboardsSettings.down) {
      this.gameService.up = false;
      this.gameService.down = true;
      this.gameService.left = false;
      this.gameService.right = false;
    }
    else if(event.code === this.configuration.keyboardsSettings.left) {
      this.gameService.up = false;
      this.gameService.down = false;
      this.gameService.left = true;
      this.gameService.right = false;
    }
    else if(event.code === this.configuration.keyboardsSettings.right) {
      this.gameService.up = false;
      this.gameService.down = false;
      this.gameService.left = false;
      this.gameService.right = true;
    }
  }

  keyUp(event: KeyboardEvent): void {
    switch(event.code) {
      case this.configuration.keyboardsSettings.up:
      case this.configuration.keyboardsSettings.down:
      case this.configuration.keyboardsSettings.left:
      case this.configuration.keyboardsSettings.right: {
        this.gameService.up = false;
        this.gameService.down = false;
        this.gameService.left = false;
        this.gameService.right = false;
      }
    }
  }
}
