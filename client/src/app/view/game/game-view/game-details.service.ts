import { Injectable } from '@angular/core';

import { MapModel } from '@app/view/game/models/map.model';
import { TileModel } from '@app/view/game/models/tile.model';
import { TileType } from '@app/view/game/models/tile-type.model';
import { HeroModel } from '@app/view/game/models/hero.model';
import { UserId } from '@app/core/storages/user-details.storage';

@Injectable({
  providedIn: 'root'
})
export class GameDetailsService {
  @UserId() userId;
  playerCorner: number;

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

  getMap(): MapModel {
    const tiles: TileModel[][] = [];
    tiles[0] = [{
      id: 0,
      x: 0,
      y: 0,
      type: TileType.NOTHING
    } as TileModel, {
      id: 1,
      x: 1,
      y: 0,
      type: TileType.NOTHING
    } as TileModel, {
      id: 2,
      x: 2,
      y: 0,
      type: TileType.FRAGILE_WALL
    } as TileModel, {
      id: 3,
      x: 3,
      y: 0,
      type: TileType.NOTHING
    } as TileModel, {
      id: 4,
      x: 4,
      y: 0,
      type: TileType.NOTHING
    } as TileModel,

      {
        id: 5,
        x: 0,
        y: 1,
        type: TileType.NOTHING
      } as TileModel, {
        id: 6,
        x: 1,
        y: 1,
        type: TileType.WALL
      } as TileModel, {
        id: 7,
        x: 2,
        y: 1,
        type: TileType.NOTHING
      } as TileModel, {
        id: 8,
        x: 3,
        y: 1,
        type: TileType.WALL
      } as TileModel, {
        id: 9,
        x: 4,
        y: 1,
        type: TileType.NOTHING
      } as TileModel,

      {
        id: 10,
        x: 0,
        y: 2,
        type: TileType.NOTHING
      } as TileModel, {
        id: 11,
        x: 1,
        y: 2,
        type: TileType.NOTHING
      } as TileModel, {
        id: 12,
        x: 2,
        y: 2,
        type: TileType.NOTHING
      } as TileModel, {
        id: 13,
        x: 3,
        y: 2,
        type: TileType.NOTHING
      } as TileModel, {
        id: 14,
        x: 4,
        y: 2,
        type: TileType.FRAGILE_WALL
      } as TileModel,

      {
        id: 15,
        x: 0,
        y: 3,
        type: TileType.NOTHING
      } as TileModel, {
        id: 16,
        x: 1,
        y: 3,
        type: TileType.WALL
      } as TileModel, {
        id: 17,
        x: 2,
        y: 3,
        type: TileType.NOTHING
      } as TileModel, {
        id: 18,
        x: 3,
        y: 3,
        type: TileType.WALL
      } as TileModel, {
        id: 19,
        x: 4,
        y: 3,
        type: TileType.NOTHING
      } as TileModel,

      {
        id: 20,
        x: 0,
        y: 4,
        type: TileType.NOTHING
      } as TileModel, {
        id: 21,
        x: 1,
        y: 4,
        type: TileType.NOTHING
      } as TileModel, {
        id: 22,
        x: 2,
        y: 4,
        type: TileType.NOTHING
      } as TileModel, {
        id: 23,
        x: 3,
        y: 4,
        type: TileType.NOTHING
      } as TileModel, {
        id: 24,
        x: 4,
        y: 4,
        type: TileType.NOTHING
      } as TileModel,
    ];


    return {
      tiles: tiles
    } as MapModel;
  }
}
