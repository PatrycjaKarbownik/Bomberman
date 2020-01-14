import { TileModel } from '@app/view/game/game-view/models/tile.model';

export interface BombExplodedModel {
  removedBombs: TileModel[];
  removedBonuses: TileModel[];
  removedFragileWalls: TileModel[];
  newBonuses: TileModel[];
  flames: TileModel[];
}
