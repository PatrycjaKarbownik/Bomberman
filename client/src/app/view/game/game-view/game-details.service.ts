import { EventEmitter, Injectable } from '@angular/core';

import { TileModel } from '@app/view/game/game-view/models/tile.model';
import { TileType } from '@app/view/game/game-view/models/tile-type.model';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';
import { Username } from '@app/core/storages/user-details.storage';
import { ServerConnectionService } from '@app/view/game/game-view/server-connection/server-connection.service';

// game details service
// gets needed initial information via server-connection service
// like players and map details
@Injectable({
  providedIn: 'root'
})
export class GameDetailsService {
  @Username() username;

  player: PlayerDetailsModel;
  private walls: TileModel[];
  private otherPlayers: PlayerDetailsModel[];
  private mapLoaded = false;
  private playerLoaded = false;
  private configurationSetEmitter: EventEmitter<boolean> = new EventEmitter();

  private temporaryTileHeight = 140;

  constructor(private serverConnectionService: ServerConnectionService) {
    this.listenMapInfo();
    this.listenInitialPlayersInfo();
  }

  private listenMapInfo() {
    this.serverConnectionService.getMapInfoEmitter().subscribe((walls: TileModel[]) => {
      this.walls = walls.filter(it => it.type !== TileType.NOTHING);
      console.log('walls', this.walls);
      this.mapLoaded = true;
      this.emitConfigurationSet();
    });
  }

  private listenInitialPlayersInfo() {
    this.serverConnectionService.getInitialPlayersInfoEmitter().subscribe((players: PlayerDetailsModel[]) => {
      this.otherPlayers = players.filter(it => it.username !== this.username);
      console.log('other playaers', this.otherPlayers);
      this.player = players.find(it => it.username === this.username);
      this.playerLoaded = true;
      this.emitConfigurationSet();
    })
  }

  private emitConfigurationSet() {
    this.configurationSetEmitter.emit(this.mapLoaded && this.playerLoaded);
  }

  getConfigurationSetEmitter() {
    return this.configurationSetEmitter;
  }

  getOtherPlayers(): PlayerDetailsModel[] {
    return this.otherPlayers;
  }

  getWalls(): TileModel[] {
    return this.walls;
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
