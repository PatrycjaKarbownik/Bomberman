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
  mapSize = 11;
  tileHeight = this.mapHeight / this.mapSize;
  tileWidth = this.mapWidth / this.mapSize;

  spritePath = '/assets/images/sprite.png';
  sprites: Sprite[];
  keyboardsSettings;

  constructor() {
    this.setSprites();
    this.keyboardsSettings = new KeyboardSettings();
  }

  private setSprites() {
    this.sprites = [
      { // TOP LEFT - chicken
        spriteX: 179,
        spriteY: 2,
        spriteWidth: 128,
        spriteHeight: 128,
        width: 0.70 * this.tileWidth,
        height: 0.70 * this.tileHeight
      },
      { // TOP RIGHT - pig
        spriteX: 38,
        spriteY: 145,
        spriteWidth: 128,
        spriteHeight: 128,
        width: 0.70 * this.tileWidth,
        height: 0.70 * this.tileHeight
      },
      { // BOTTOM LEFT - whale
        spriteX: 179,
        spriteY: 145,
        spriteWidth: 128,
        spriteHeight: 128,
        width: 0.70 * this.tileWidth,
        height: 0.70 * this.tileHeight
      },
      { // BOTTOM RIGHT - chick
        spriteX: 38,
        spriteY: 2,
        spriteWidth: 128,
        spriteHeight: 128,
        width: 0.70 * this.tileWidth,
        height: 0.70 * this.tileHeight
      },
      { // bomb
        spriteX: 38,
        spriteY: 595,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // wall
        spriteX: 179,
        spriteY: 400,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // fragile wall
        spriteX: 38,
        spriteY: 400,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // range_inc
        spriteX: 400,
        spriteY: 2,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // range_desc
        spriteX: 545,
        spriteY: 2,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // bomb_inc
        spriteX: 400,
        spriteY: 145,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // bomb_desc
        spriteX: 545,
        spriteY: 145,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // speed_inc
        spriteX: 400,
        spriteY: 290,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // speed_desc
        spriteX: 545,
        spriteY: 290,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // push_bomb
        spriteX: 400,
        spriteY: 425,
        spriteWidth: 128,
        spriteHeight: 128,
        width: this.tileWidth,
        height: this.tileHeight
      },
      { // fire_horizontal
        spriteX: 38,
        spriteY: 750,
        spriteWidth: 128,
        spriteHeight: 128,
        width: null,
        height: null
      },
      { // fire_vertical
        spriteX: 179,
        spriteY: 750,
        spriteWidth: 128,
        spriteHeight: 128,
        width: null,
        height: null
      },
    ];
  }
}
