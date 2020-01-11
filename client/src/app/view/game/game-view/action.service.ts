import { EventEmitter, Injectable } from '@angular/core';

import { GameService } from '@app/view/game/game-view/game.service';

@Injectable({
  providedIn: 'root'
})
export class ActionService {

  private isImageLoaded: EventEmitter<number> = new EventEmitter();

  constructor(private gameService: GameService) { }

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
    if(event.code === "Space") {
      this.setBomb();
    }
    if(event.code === "ArrowUp") {
      this.gameService.up = true;
      this.gameService.down = false;
      this.gameService.left = false;
      this.gameService.right = false;
    } else if(event.code === "ArrowDown") {
      this.gameService.up = false;
      this.gameService.down = true;
      this.gameService.left = false;
      this.gameService.right = false;
    }
    else if(event.code === "ArrowLeft") {
      this.gameService.up = false;
      this.gameService.down = false;
      this.gameService.left = true;
      this.gameService.right = false;
    }
    else if(event.code === "ArrowRight") {
      this.gameService.up = false;
      this.gameService.down = false;
      this.gameService.left = false;
      this.gameService.right = true;
    }
  }

  keyUp(): void {
    this.gameService.up = false;
    this.gameService.down = false;
    this.gameService.left = false;
    this.gameService.right = false;
  }

  setBomb() {
    console.log('setBomb');
  }
}
