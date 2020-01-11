import { Injectable } from '@angular/core';

import { GameDetailsService } from '@app/view/game/game-view/game-details.service';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';
import { Configuration } from '@app/view/game/game-view/models/configuration';
import { Sprite } from '@app/view/game/game-view/models/sprite.model';
import { BombModel } from '@app/view/game/game-view/models/bomb.model';
import { SpriteType } from '@app/view/game/game-view/models/sprite-type.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // view details
  private image: HTMLImageElement = null;
  private context: CanvasRenderingContext2D;
  private gameLoop = null;

  // other items
  private bombs: BombModel[] = [];

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
      this.image.src = this.configuration.spritePath;
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
      this.createBombs();
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

  private createBombs() {
    let bombSprite = this.configuration.sprites[SpriteType.BOMB];
    this.bombs.forEach(bomb => {
      this.context.drawImage(
        this.image,
        bombSprite.spriteX, bombSprite.spriteY,
        bombSprite.spriteWidth, bombSprite.spriteHeight,
        bomb.x, bomb.y,
        bombSprite.width, bombSprite.height
      )
    })
  }

  private clearGround() {
    this.context.clearRect(0, 0, this.configuration.mapWidth, this.configuration.mapHeight);
  }

  private setPlayerDetails() {
    this.playerCorner = this.gameDetailsService.playerCorner;
    this.player = this.configuration.startPositions[this.playerCorner];
    this.playerSprite = this.configuration.sprites[this.playerCorner];
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

  setBomb() {
    let horizontalTileNumber = Math.floor(this.player.x / this.configuration.tileWidth);
    let leftTile = horizontalTileNumber * this.configuration.tileWidth;
    let rightTile = (horizontalTileNumber + 1) * this.configuration.tileWidth;

    let verticalTileNumber = Math.floor(this.player.y / this.configuration.tileHeight);
    let topTile = verticalTileNumber * this.configuration.tileHeight;
    let bottomTile = (verticalTileNumber + 1) * this.configuration.tileHeight;

    this.bombs.push({
      x: this.chooseTile(this.player.x, leftTile, rightTile),
      y: this.chooseTile(this.player.y, topTile, bottomTile)
    } as BombModel)
  }

  private chooseTile(playerPosition: number, prevTilePosition: number, nextTilePosition: number): number {
    if (Math.abs(playerPosition - prevTilePosition) < Math.abs(playerPosition - nextTilePosition)) {
      return prevTilePosition;
    } else {
      return nextTilePosition;
    }
  }

}
