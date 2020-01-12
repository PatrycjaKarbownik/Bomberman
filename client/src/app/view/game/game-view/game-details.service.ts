import { Injectable } from '@angular/core';

import { TileModel } from '@app/view/game/models/tile.model';
import { TileType } from '@app/view/game/models/tile-type.model';
import { HeroModel } from '@app/view/game/models/hero.model';
import { UserId } from '@app/core/storages/user-details.storage';

// game details service
// connects with gamehost
// and gets needed initial information
// like players and map details
@Injectable({
  providedIn: 'root'
})
export class GameDetailsService {
  @UserId() userId;
  playerCorner: number;

  private temporaryTileHeight = 140;

  constructor() {
    this.playerCorner = this.getHeroes().find(it => it.id === this.userId).inGameId % 4;
  }

  getHeroes(): HeroModel[] {
    return [
      {
        id: 8,
        inGameId: 0
      } as HeroModel,
      {
        id: 9,
        inGameId: 1
      } as HeroModel,
      {
        id: 6,
        inGameId: 2
      } as HeroModel,
      {
        id: 7,
        inGameId: 3
      } as HeroModel,
    ];
  }

  getWalls(): TileModel[] {
    return [{
      id: 0,
      x: 2 * this.temporaryTileHeight,
      y: 0 * this.temporaryTileHeight,
      type: TileType.FRAGILE
    } as TileModel, {
      id: 1,
      x: 1 * this.temporaryTileHeight,
      y: 1 * this.temporaryTileHeight,
      type: TileType.WALL
    } as TileModel, {
      id: 2,
      x: 3 * this.temporaryTileHeight,
      y: 1 * this.temporaryTileHeight,
      type: TileType.WALL
    } as TileModel, {
      id: 3,
      x: 4 * this.temporaryTileHeight,
      y: 2 * this.temporaryTileHeight,
      type: TileType.FRAGILE
    } as TileModel, {
      id: 4,
      x: 1 * this.temporaryTileHeight,
      y: 3 * this.temporaryTileHeight,
      type: TileType.WALL
    } as TileModel, {
      id: 5,
      x: 3 * this.temporaryTileHeight,
      y: 3 * this.temporaryTileHeight,
      type: TileType.WALL
    } as TileModel
    ];
  }

  getBonuses(): TileModel[] {
    return [{
      id: 6,
      x: 2 * this.temporaryTileHeight,
      y: 1 * this.temporaryTileHeight,
      type: TileType.PUSH_BOMB
    } as TileModel,{
      id: 7,
      x: 0 * this.temporaryTileHeight,
      y: 2 * this.temporaryTileHeight,
      type: TileType.SPEED_INC
    } as TileModel,{
      id: 8,
      x: 1 * this.temporaryTileHeight,
      y: 2 * this.temporaryTileHeight,
      type: TileType.RANGE_DESC
    } as TileModel,{
      id: 9,
      x: 2 * this.temporaryTileHeight,
      y: 2 * this.temporaryTileHeight,
      type: TileType.SPEED_DESC
    } as TileModel,{
      id: 10,
      x: 3 * this.temporaryTileHeight,
      y: 2 * this.temporaryTileHeight,
      type: TileType.BOMB_INC
    } as TileModel,{
      id: 11,
      x: 2 * this.temporaryTileHeight,
      y: 3 * this.temporaryTileHeight,
      type: TileType.RANGE_INC
    } as TileModel,{
      id: 12,
      x: 2 * this.temporaryTileHeight,
      y: 4 * this.temporaryTileHeight,
      type: TileType.BOMB_DESC
    } as TileModel,

    ];
  }
}
