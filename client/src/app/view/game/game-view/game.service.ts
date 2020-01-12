import { Injectable } from '@angular/core';

import { GameDetailsService } from '@app/view/game/game-view/game-details.service';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';
import { Configuration } from '@app/view/game/game-view/models/configuration';
import { Sprite } from '@app/view/game/game-view/models/sprite.model';
import { BombModel } from '@app/view/game/game-view/models/bomb.model';
import { SpriteType } from '@app/view/game/game-view/models/sprite-type.model';
import { TileModel } from '@app/view/game/models/tile.model';
import { TileType } from '@app/view/game/models/tile-type.model';

// game service
// answer for game view dependent on game logic
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
  private tiles: TileModel[];
  private bonuses: TileModel[];

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
    this.tiles = gameDetailsService.getTiles();
    this.bonuses = gameDetailsService.getBonuses();
  }

  loadAssets(canvasElement: HTMLCanvasElement): Promise<void> {
    this.context = canvasElement.getContext('2d');

    canvasElement.width = this.configuration.mapWidth;
    canvasElement.height = this.configuration.mapHeight;

    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.src = this.configuration.spritePath;
      this.image.width = 1048;
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
      this.drawTiles();
      this.drawBombs();
      this.drawPlayer();
    }, 10);
  }

  private drawTiles() {
    this.tiles.concat(this.bonuses).forEach(tile => {
      let sprite = this.getTileSprite(tile.type);
      this.context.drawImage(
        this.image,
        sprite.spriteX, sprite.spriteY,
        sprite.spriteWidth, sprite.spriteHeight,
        tile.x, tile.y,
        sprite.width, sprite.height
      );
    });
  }

  private drawBombs() {
    let bombSprite = this.configuration.sprites[SpriteType.BOMB];
    this.bombs.forEach(bomb => {
      this.context.drawImage(
        this.image,
        bombSprite.spriteX, bombSprite.spriteY,
        bombSprite.spriteWidth, bombSprite.spriteHeight,
        bomb.x, bomb.y,
        bombSprite.width, bombSprite.height
      );
    });
  }

  private drawPlayer() {
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

  // cleans game view - it's necessary, because next frames will be rendered on previous canvas.
  // if we don't want have all of frames on canvas, we have to clean it and render anew
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

    let x = this.chooseTile(this.player.x, leftTile, rightTile);
    let y = this.chooseTile(this.player.y, topTile, bottomTile);

    if (!this.isBombPresentAtTile(x, y)) {
      this.bombs.push({
        x: x,
        y: y
      } as BombModel);
    }
  }

  // calculates coordinates of e.g. bomb.
  // when player is on two tiles at the same time,
  // we have to calculate when should be bomb placing - on first or second tile
  private chooseTile(playerPosition: number, prevTilePosition: number, nextTilePosition: number): number {
    if (Math.abs(playerPosition - prevTilePosition) < Math.abs(playerPosition - nextTilePosition)) {
      return prevTilePosition;
    } else {
      return nextTilePosition;
    }
  }

  // checks if bomb can be placed on (x, y) position
  private isBombPresentAtTile(x: number, y: number): boolean {
    return this.bombs.find(it => it.x === x && it.y === y) !== undefined;
  }

  private getTileSprite(tileType: TileType): Sprite {
    if (tileType === TileType.WALL) return this.configuration.sprites[SpriteType.WALL];
    if (tileType === TileType.FRAGILE) return this.configuration.sprites[SpriteType.FRAGILE];
    if (tileType === TileType.RANGE_INC) return this.configuration.sprites[SpriteType.RANGE_INC];
    if (tileType === TileType.RANGE_DESC) return this.configuration.sprites[SpriteType.RANGE_DESC];
    if (tileType === TileType.BOMB_INC) return this.configuration.sprites[SpriteType.BOMB_INC];
    if (tileType === TileType.BOMB_DESC) return this.configuration.sprites[SpriteType.BOMB_DESC];
    if (tileType === TileType.SPEED_INC) return this.configuration.sprites[SpriteType.SPEED_INC];
    if (tileType === TileType.SPEED_DESC) return this.configuration.sprites[SpriteType.SPEED_DESC];
    if (tileType === TileType.PUSH_BOMB) return this.configuration.sprites[SpriteType.PUSH_BOMB];
  }

}
