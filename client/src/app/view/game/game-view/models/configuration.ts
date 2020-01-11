import { Injectable } from '@angular/core';

import { Sprite } from '@app/view/game/game-view/models/sprite.model';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';

@Injectable({
  providedIn: 'root'
})
export class Configuration {
  mapHeight = 700;
  mapWidth = this.mapHeight;
  backgroundPath = '/assets/images/sprite.png';
  playerSprites: Sprite[];
  bombSprite: Sprite;
  wallSprite: Sprite;
  fragileWallSprite: Sprite;
  startPositions: PlayerDetailsModel[];
  mapSize = 5;
  tileHeight = this.mapHeight / this.mapSize;
  tileWidth = this.mapWidth / this.mapSize;

  constructor() {
    this.setPlayerSprites();
    this.setStartPositions();
    this.setOtherSprites();
  }

  private setPlayerSprites() {
    this.playerSprites = [
      { // TOP LEFT - chicken
        spriteX: 1179,
        spriteY: 2,
        spriteWidth: 128,
        spriteHeight: 128,
        width: 0.70 * this.tileWidth,
        height: 0.70 * this.tileHeight
      },
      { // TOP RIGHT - pig
        spriteX: 1038,
        spriteY: 145,
        spriteWidth: 128,
        spriteHeight: 128,
        width: 0.70 * this.tileWidth,
        height: 0.70 * this.tileHeight
      },
      { // BOTTOM LEFT - whale
        spriteX: 1179,
        spriteY: 145,
        spriteWidth: 128,
        spriteHeight: 128,
        width: 0.70 * this.tileWidth,
        height: 0.70 * this.tileHeight
      },
      { // BOTTOM RIGHT - chick
        spriteX: 1038,
        spriteY: 2,
        spriteWidth: 128,
        spriteHeight: 128,
        width: 0.70 * this.tileWidth,
        height: 0.70 * this.tileHeight
      }
    ];
  }

  private setStartPositions() {
    this.startPositions = [
      { // TOP LEFT - chicken
        x: 0.15 * this.tileWidth,
        y: 0.15 * this.tileHeight,
        speed: 2
      },
      { // TOP RIGHT - pig
        x: this.mapWidth - 0.85 * this.tileWidth,
        y: 0.15 * this.tileHeight,
        speed: 2
      },
      { // BOTTOM LEFT - whale
        x: 0.15 * this.tileWidth,
        y: this.mapHeight - 0.85 * this.tileHeight,
        speed: 2
      },
      { // BOTTOM RIGHT - chick
        x: this.mapWidth - 0.85 * this.tileWidth,
        y: this.mapHeight - 0.85 * this.tileHeight,
        speed: 2
      }
    ];
  }

  setOtherSprites() {
    this.bombSprite = { // bomb
      spriteX: 1038,
      spriteY: 595,
      spriteWidth: 128,
      spriteHeight: 128,
      width: this.tileWidth,
      height: this.tileHeight
    };

    this.wallSprite = { // wall
      spriteX: 1179,
      spriteY: 400,
      spriteWidth: 128,
      spriteHeight: 128,
      width: this.tileWidth,
      height: this.tileHeight
    };

    this.fragileWallSprite = { // fragile wall
      spriteX: 1038,
      spriteY: 400,
      spriteWidth: 128,
      spriteHeight: 128,
      width: this.tileWidth,
      height: this.tileHeight
    };
  }
}
