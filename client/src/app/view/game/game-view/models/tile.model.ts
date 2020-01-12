import { TileType } from '@app/view/game/game-view/models/tile-type.model';

export interface TileModel {
  id: number;
  x: number;
  y: number;
  type: TileType;
}
