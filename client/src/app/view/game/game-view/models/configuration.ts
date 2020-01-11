import { Injectable } from '@angular/core';

import { Sprite } from '@app/view/game/game-view/models/sprite.model';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';
import { KeyboardSettings } from '@app/view/game/game-view/models/keyboard-settings.model';

@Injectable({
  providedIn: 'root'
})
export class Configuration {
  // map configurations
  mapHeight = 700;
  mapWidth = this.mapHeight;
  mapSize = 5;
  tileHeight = this.mapHeight / this.mapSize;
  tileWidth = this.mapWidth / this.mapSize;

  spritePath = '/assets/images/sprite.png';
  sprites: Sprite[];
  startPositions: PlayerDetailsModel[];
  keyboardsSettings;

  constructor() {
    this.setSprites();
    this.setStartPositions();
    this.keyboardsSettings = new KeyboardSettings();
  }

  private setSprites() {
    this.sprites = [
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
      },
      { // bomb
        spriteX: 1038,
        spriteY: 595,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // wall
        spriteX: 1179,
        spriteY: 400,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // fragile wall
        spriteX: 1038,
        spriteY: 400,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
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
}
