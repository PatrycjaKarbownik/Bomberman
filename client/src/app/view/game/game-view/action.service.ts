import { EventEmitter, Injectable } from '@angular/core';

import { GameService } from '@app/view/game/game-view/game.service';
import { MapConfiguration } from '@app/view/game/game-view/models/map-configuration';

@Injectable({
  providedIn: 'root'
})
export class ActionService { // todo: change service name

  private assetsLoaded: boolean = false;
  private configurationSet: boolean = false;
  private isImageLoaded: EventEmitter<boolean> = new EventEmitter();

  constructor(private gameService: GameService, private configuration: MapConfiguration) { }

  createPlayGround(canvasElement): void {
    this.gameService.loadAssets(canvasElement).then(/*() => {
      setTimeout(() => {
        this.assetsLoaded = true;
        this.isImageLoaded.emit(this.assetsLoaded && this.configurationSet);
      }, 1000);
    }*/);
  }

  setConfiguration() {
    console.log('set map');
  }

  getConfigurationSetEmitter() {
    return this.isImageLoaded;
  }

  keyDown(event: KeyboardEvent): void {
    if (event.code === this.configuration.keyboardsSettings.placeBomb) {
      this.gameService.setBomb();
    }
    if (event.code === this.configuration.keyboardsSettings.up) {
      this.gameService.up = true;
      this.gameService.down = false;
      this.gameService.left = false;
      this.gameService.right = false;
    } else if (event.code === this.configuration.keyboardsSettings.down) {
      this.gameService.up = false;
      this.gameService.down = true;
      this.gameService.left = false;
      this.gameService.right = false;
    } else if (event.code === this.configuration.keyboardsSettings.left) {
      this.gameService.up = false;
      this.gameService.down = false;
      this.gameService.left = true;
      this.gameService.right = false;
    } else if (event.code === this.configuration.keyboardsSettings.right) {
      this.gameService.up = false;
      this.gameService.down = false;
      this.gameService.left = false;
      this.gameService.right = true;
    }
  }

  keyUp(event: KeyboardEvent): void {
    switch (event.code) {
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
