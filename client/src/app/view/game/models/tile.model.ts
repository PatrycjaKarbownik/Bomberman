import { TileType } from '@app/view/game/models/tile-type.model';

export interface TileModel {
  id: number;
  x: number;
  y: number;
  type: TileType;
}
