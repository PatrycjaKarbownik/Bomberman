import { Injectable } from '@angular/core';

import { GameDetailsService } from '@app/view/game/game-view/game-details.service';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';
import { Configuration } from '@app/view/game/game-view/models/configuration';
import { Sprite } from '@app/view/game/game-view/models/sprite.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // view details
  private image: HTMLImageElement = null;
  private wallImage: HTMLImageElement = null;
  private fragileWallImage: HTMLImageElement = null;
  private context: CanvasRenderingContext2D;
  private gameLoop = null;

  // player details
  private player: PlayerDetailsModel = null;
  private playerCorner;
  private playerSprite: Sprite;

  // player move
  up = false;
  down = false;
  left = false;
  right = false;

  constructor(private gameDetailsService: GameDetailsService, private configuration: Configuration) {

  }

  loadAssets(canvasElement: HTMLCanvasElement): Promise<void> {
    this.context = canvasElement.getContext('2d');

    canvasElement.width = this.configuration.mapWidth;
    canvasElement.height = this.configuration.mapHeight;

    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.src = this.configuration.backgroundPath;
      this.image.width = 2048;
      this.image.height = 1024;
      this.image.onload = () => {
        resolve();
      };
    });
  }

  startGameLoop() {
    this.setPlayerDetails();
    this.gameLoop = setInterval(() => {
      this.clearGround();
      // this.createOpponents();
      // this.moveObstacles();
      this.createPlayer();
    }, 10);
  }

  private createPlayer() {
    if (this.up) {
      this.moveUp();
    } else if (this.down) {
      this.moveDown();
    } else if (this.left) {
      this.moveLeft();
    } else if (this.right) this.moveRight();

    this.context.drawImage(
      this.image,
      this.playerSprite.spriteX, this.playerSprite.spriteY,
      this.playerSprite.spriteWidth, this.playerSprite.spriteHeight,
      this.player.x, this.player.y,
      this.playerSprite.width, this.playerSprite.height,
    );
  }

  private clearGround() {
    this.context.clearRect(0, 0, this.configuration.mapWidth, this.configuration.mapHeight);
  }

  private setPlayerDetails() {
    this.playerCorner = this.gameDetailsService.playerCorner;
    this.player = this.configuration.startPositions[this.playerCorner];
    this.playerSprite = this.configuration.playerSprites[this.playerCorner];
  }

  private moveUp() {
    if (this.player.y - this.player.speed < 0) {
      this.player.y = 0;
    } else {
      this.player.y -= this.player.speed;
    }
  }

  private moveDown() {
    if (this.player.y + this.player.speed + this.playerSprite.height > this.configuration.mapHeight) {
      this.player.y = this.configuration.mapHeight - this.playerSprite.height;
    } else {
      this.player.y += this.player.speed;
    }
  }

  private moveLeft() {
    if (this.player.x - this.player.speed < 0) {
      this.player.x = 0;
    } else {
      this.player.x -= this.player.speed;
    }
  }

  private moveRight() {
    if (this.player.x + this.player.speed + this.playerSprite.width > this.configuration.mapWidth) {
      this.player.x = this.configuration.mapWidth - this.playerSprite.width;
    } else {
      this.player.x += this.player.speed;
    }
  }

}
