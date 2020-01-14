import { EventEmitter, Injectable } from '@angular/core';

import { TileModel } from '@app/view/game/game-view/models/tile.model';
import { TileType } from '@app/view/game/game-view/models/tile-type.model';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';
import { Username } from '@app/core/storages/user-details.storage';
import { ServerConnectionService } from '@app/view/game/server-connection/server-connection.service';

// game details service
// gets needed initial information via server-connection service
// like players and map details
@Injectable({
  providedIn: 'root'
})
export class InitialGameService {
  @Username() username;

  player: PlayerDetailsModel;
  private walls: TileModel[];
  private otherPlayers: PlayerDetailsModel[];
  private mapLoaded = false;
  private playerLoaded = false;
  private configurationSetEmitter: EventEmitter<boolean> = new EventEmitter();

  constructor(private serverConnectionService: ServerConnectionService) {
    this.listenMapInfo();
    this.listenInitialPlayersInfo();
  }

  private listenMapInfo() {
    this.serverConnectionService.getMapInfoEmitter().subscribe((walls: TileModel[]) => {
      this.walls = walls.filter(it => it.type !== TileType.NOTHING);
      this.mapLoaded = true;
      this.emitConfigurationSet();
    });
  }

  private listenInitialPlayersInfo() {
    this.serverConnectionService.getInitialPlayersInfoEmitter().subscribe((players: PlayerDetailsModel[]) => {
      this.otherPlayers = players.filter(it => it.username !== this.username);
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
}
