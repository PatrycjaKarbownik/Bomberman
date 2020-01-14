import { Injectable } from '@angular/core';

import { GameDetailsService } from '@app/view/game/game-view/game-details.service';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';
import { MapConfiguration } from '@app/view/game/game-view/map-configuration';
import { Sprite } from '@app/view/game/game-view/models/sprite.model';
import { BombModel } from '@app/view/game/game-view/models/bomb.model';
import { SpriteType } from '@app/view/game/game-view/models/sprite-type.model';
import { TileModel } from '@app/view/game/game-view/models/tile.model';
import { TileType } from '@app/view/game/game-view/models/tile-type.model';
import { ServerConnectionService } from '@app/view/game/game-view/server-connection/server-connection.service';
import { BombExplodedModel } from '@app/view/game/game-view/server-connection/bomb-exploded.model';
import { FlamesModel } from '@app/view/game/game-view/server-connection/flames.model';

// game service
// answer for game view dependent on game logic
@Injectable({
  providedIn: 'root'
})
export class GameService {
  // view details
  private image: HTMLImageElement = null;
  private context: CanvasRenderingContext2D;
  private gameLoop = null;

  // other items
  private bombs: BombModel[] = []; // bombs placed by other players
  private playerBombs: BombModel[] = []; // bombs placed by player
  // collection of bombs which were placed under player and he didn't leave these tiles yet
  // it's needed, because player have to leave tiles on which are placing bomb
  // it's necessary to split them
  private bombsUnderPlayer: BombModel[] = [];
  private flames: FlamesModel[] = [];
  private walls: TileModel[];
  private otherPlayers: PlayerDetailsModel[];
  private bonuses: TileModel[] = [];

  // player details
  private player: PlayerDetailsModel = null;
  private playerSprite: Sprite;

  // player move
  up = false;
  down = false;
  left = false;
  right = false;

  constructor(private gameDetailsService: GameDetailsService, private serverConnectionService: ServerConnectionService,
              private configuration: MapConfiguration) {

    this.setServerSubscriptions();
  }

  createPlayground(canvasElement: HTMLCanvasElement): Promise<void> {
    this.context = canvasElement.getContext('2d');

    canvasElement.width = this.configuration.mapWidth;
    canvasElement.height = this.configuration.mapHeight;

    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.src = this.configuration.spritePath;
      this.image.width = 1048;
      this.image.height = 1024;
      this.image.onload = () => {
        resolve();
      };
    });
  }

  // enable refreshing map state (players', bombs', bonuses' positions)
  // and checking validity of player's actions
  setServerSubscriptions() {
    this.setConfigurationSubscription();
    this.setOtherPlayersUpdateSubscription();
    this.setPlayerUpdateSubscription();
    this.setNewBombsSubscription();
    this.setRejectedBombsSubscription();
    this.setBombExplodedSubscription();
    this.setPickedBonusSubscription();
  }

  startGameLoop() {
    this.setPlayerDetails();
    this.gameLoop = setInterval(() => {
      this.clearGround();
      this.drawTiles();
      this.drawFlames();
      this.checkIfPlayerLeavesTilesWithBomb();
      this.drawBombs();
      this.drawOtherPlayers();
      this.drawPlayer();
    }, 10);
  }

  private drawTiles() {
    this.walls.concat(this.bonuses).forEach(tile => {
      let sprite = this.getTileSprite(tile.type);
      this.context.drawImage(
        this.image,
        sprite.spriteX, sprite.spriteY,
        sprite.spriteWidth, sprite.spriteHeight,
        tile.x, tile.y,
        sprite.width, sprite.height
      );
    });
  }

  private drawFlames() {
    let flameSprite = this.getTileSprite(TileType.FIRE);

    this.flames.filter(flames => flames.frameNumber === 100)
      .forEach(it => this.flames.splice(this.flames.indexOf(it), 1));


    this.flames.forEach(it => {
      it.frameNumber += 1;
      it.flames.forEach(flame => {
        this.context.drawImage(
          this.image,
          flameSprite.spriteX, flameSprite.spriteY,
          flameSprite.spriteWidth, flameSprite.spriteHeight,
          flame.x, flame.y,
          flameSprite.width, flameSprite.height
        );
      })
    })
  }

  private drawBombs() {
    let bombSprite = this.configuration.sprites[SpriteType.BOMB];
    this.bombs.concat(this.bombsUnderPlayer).concat(this.playerBombs).forEach(bomb => {
      this.context.drawImage(
        this.image,
        bombSprite.spriteX, bombSprite.spriteY,
        bombSprite.spriteWidth, bombSprite.spriteHeight,
        bomb.x, bomb.y,
        bombSprite.width, bombSprite.height
      );
    });
  }

  private drawOtherPlayers() {
    this.otherPlayers.filter(it => it.alive === true)
      .forEach(player => {
        let playerSprite = this.configuration.sprites[player.inGameId % 4];
        this.context.drawImage(
          this.image,
          playerSprite.spriteX, playerSprite.spriteY,
          playerSprite.spriteWidth, playerSprite.spriteHeight,
          player.x, player.y,
          playerSprite.width, playerSprite.height,
        );
      });
  }

  private drawPlayer() {
    if (this.player.alive) {
      if (this.up) {
        this.moveUp();
      } else if (this.down) {
        this.moveDown();
      } else if (this.left) {
        this.moveLeft();
      } else if (this.right) this.moveRight();

      this.context.drawImage(
        this.image,
        this.playerSprite.spriteX, this.playerSprite.spriteY,
        this.playerSprite.spriteWidth, this.playerSprite.spriteHeight,
        this.player.x, this.player.y,
        this.playerSprite.width, this.playerSprite.height,
      );
    }
  }

  // cleans game view - it's necessary, because next frames will be rendered on previous canvas.
  // if we don't want have all of frames on canvas, we have to clean it and render anew
  private clearGround() {
    this.context.clearRect(0, 0, this.configuration.mapWidth, this.configuration.mapHeight);
  }

  private setPlayerDetails() {
    this.player = this.gameDetailsService.player;
    this.playerSprite = this.configuration.sprites[this.player.inGameId % 4];
  }

  private moveUp() {
    let collidedObjectCoordinate = this.getCollidedObjectCoordinate(0, -this.player.speed);
    if (this.player.y - this.player.speed < 0) {
      this.player.y = 0;
    } else if (collidedObjectCoordinate != undefined) {
      this.player.y = collidedObjectCoordinate[1] + this.configuration.tileHeight;
    } else {
      this.player.y -= this.player.speed;
    }

    this.serverConnectionService.sendMoveRequest(this.player.x, this.player.y);
  }

  private moveDown() {
    let collidedObjectCoordinate = this.getCollidedObjectCoordinate(0, +this.player.speed);
    if (this.player.y + this.player.speed + this.playerSprite.height > this.configuration.mapHeight) {
      this.player.y = this.configuration.mapHeight - this.playerSprite.height;
    } else if (collidedObjectCoordinate != undefined) {
      this.player.y = collidedObjectCoordinate[1] - 0.7 * this.configuration.tileHeight;
    } else {
      this.player.y += this.player.speed;
    }

    this.serverConnectionService.sendMoveRequest(this.player.x, this.player.y);
  }

  private moveLeft() {
    let collidedObjectCoordinate = this.getCollidedObjectCoordinate(-this.player.speed, 0);
    if (this.player.x - this.player.speed < 0) {
      this.player.x = 0;
    } else if (collidedObjectCoordinate != undefined) {
      this.player.x = collidedObjectCoordinate[0] + this.configuration.tileWidth;
    } else {
      this.player.x -= this.player.speed;
    }

    this.serverConnectionService.sendMoveRequest(this.player.x, this.player.y);
  }

  private moveRight() {
    let collidedObjectCoordinate = this.getCollidedObjectCoordinate(this.player.speed, 0);
    if (this.player.x + this.player.speed + this.playerSprite.width > this.configuration.mapWidth) {
      this.player.x = this.configuration.mapWidth - this.playerSprite.width;
    } else if (collidedObjectCoordinate != undefined) {
      this.player.x = collidedObjectCoordinate[0] - 0.7 * this.configuration.tileWidth;
    } else {
      this.player.x += this.player.speed;
    }

    this.serverConnectionService.sendMoveRequest(this.player.x, this.player.y);
  }

  // returns coordinates of object with witch player collided
  // if player didn't collide with anything, returns undefined
  private getCollidedObjectCoordinate(moveX: number, moveY: number): [number, number] {
    const supposedLeftSide = this.player.x + moveX;
    const supposedRightSide = this.player.x + moveX + this.playerSprite.width;
    const supposedTopSide = this.player.y + moveY;
    const supposedBottomSide = this.player.y + moveY + this.playerSprite.height;
    const tileWidth = this.configuration.tileWidth;
    const tileHeight = this.configuration.tileHeight;

    let wall = this.walls
      .find(wall => this.areCollisionConditionsAchieved(supposedLeftSide, supposedRightSide, supposedTopSide, supposedBottomSide,
        wall.x, wall.x + tileWidth, wall.y, wall.y + tileHeight));

    if (wall !== undefined) {
      return [wall.x, wall.y];
    }

    if (!this.player.bombPusher) {
      let bomb = this.bombs
        .find(bomb => this.areCollisionConditionsAchieved(supposedLeftSide, supposedRightSide, supposedTopSide, supposedBottomSide,
          bomb.x, bomb.x + tileWidth, bomb.y, bomb.y + tileHeight));

      if (bomb !== undefined) {
        return [bomb.x, bomb.y];
      }
    }
    return undefined;
  }

  private areCollisionConditionsAchieved(pLeft: number, pRight: number, pTop: number, pBottom: number,
                                         sLeft: number, sRight: number, sTop: number, sBottom: number): boolean {
    return pRight > sLeft && pLeft < sRight && pTop < sBottom && pBottom > sTop;
  }

  setBomb() {
    if(this.playerBombs.length < this.player.bombLimit) {
      let horizontalTileNumber = Math.floor(this.player.x / this.configuration.tileWidth);
      let leftTile = horizontalTileNumber * this.configuration.tileWidth;
      let rightTile = (horizontalTileNumber + 1) * this.configuration.tileWidth;

      let verticalTileNumber = Math.floor(this.player.y / this.configuration.tileHeight);
      let topTile = verticalTileNumber * this.configuration.tileHeight;
      let bottomTile = (verticalTileNumber + 1) * this.configuration.tileHeight;

      let x = this.chooseTile(this.player.x, leftTile, rightTile);
      let y = this.chooseTile(this.player.y, topTile, bottomTile);

      if (!this.isBombPresentAtTile(x, y)) {
        this.bombsUnderPlayer.push({
          x: x,
          y: y,
          isPlayerBomb: true
        } as BombModel);
        this.serverConnectionService.sendBombRequest(x, y);
      }
    }
  }

  // calculates coordinates of e.g. bomb.
  // when player is on two tiles at the same time,
  // we have to calculate when should be bomb placing - on first or second tile
  private chooseTile(playerPosition: number, prevTilePosition: number, nextTilePosition: number): number {
    if (Math.abs(playerPosition - prevTilePosition) < Math.abs(playerPosition - nextTilePosition)) {
      return prevTilePosition;
    } else {
      return nextTilePosition;
    }
  }

  // checks if bomb can be placed on (x, y) position
  private isBombPresentAtTile(x: number, y: number): boolean {
    return this.bombs.concat(this.bombsUnderPlayer).find(it => it.x === x && it.y === y) !== undefined;
  }

  private setNotOwnBomb(bomb: BombModel) {
    bomb.isPlayerBomb = false;

    const supposedLeftSide = this.player.x;
    const supposedRightSide = this.player.x + this.playerSprite.width;
    const supposedTopSide = this.player.y;
    const supposedBottomSide = this.player.y + this.playerSprite.height;
    const tileWidth = this.configuration.tileWidth;
    const tileHeight = this.configuration.tileHeight;

    if (!this.areCollisionConditionsAchieved(supposedLeftSide, supposedRightSide, supposedTopSide, supposedBottomSide,
      bomb.x, bomb.x + tileWidth, bomb.y, bomb.y + tileHeight)) {
      this.bombs.push(bomb);
    } else {
      this.bombsUnderPlayer.push(bomb);
    }
  }

  private checkIfPlayerLeavesTilesWithBomb() {
    const supposedLeftSide = this.player.x;
    const supposedRightSide = this.player.x + this.playerSprite.width;
    const supposedTopSide = this.player.y;
    const supposedBottomSide = this.player.y + this.playerSprite.height;
    const tileWidth = this.configuration.tileWidth;
    const tileHeight = this.configuration.tileHeight;

    this.bombsUnderPlayer.forEach(bomb => {
      if (!this.areCollisionConditionsAchieved(supposedLeftSide, supposedRightSide, supposedTopSide, supposedBottomSide,
        bomb.x, bomb.x + tileWidth, bomb.y, bomb.y + tileHeight)) {
        if (bomb.isPlayerBomb === true) {
          this.playerBombs.push(bomb);
        } else {
          this.bombs.push(bomb);
        }
        this.bombsUnderPlayer.splice(this.bombsUnderPlayer.indexOf(bomb), 1);
      }
    });
  }

  private getTileSprite(tileType: TileType): Sprite {
    if (tileType === TileType.WALL) return this.configuration.sprites[SpriteType.WALL];
    if (tileType === TileType.FRAGILE) return this.configuration.sprites[SpriteType.FRAGILE];
    if (tileType === TileType.RANGE_INC) return this.configuration.sprites[SpriteType.RANGE_INC];
    if (tileType === TileType.RANGE_DEC) return this.configuration.sprites[SpriteType.RANGE_DESC];
    if (tileType === TileType.BOMB_INC) return this.configuration.sprites[SpriteType.BOMB_INC];
    if (tileType === TileType.BOMB_DEC) return this.configuration.sprites[SpriteType.BOMB_DESC];
    if (tileType === TileType.SPEED_INC) return this.configuration.sprites[SpriteType.SPEED_INC];
    if (tileType === TileType.SPEED_DEC) return this.configuration.sprites[SpriteType.SPEED_DESC];
    if (tileType === TileType.PUSH_BOMB) return this.configuration.sprites[SpriteType.PUSH_BOMB];
    if (tileType === TileType.FIRE) return this.configuration.sprites[SpriteType.FIRE];
  }

  private setConfigurationSubscription() {
    this.gameDetailsService.getConfigurationSetEmitter()
      .subscribe(configurationSet => {
        if (configurationSet === true) {
          this.walls = this.gameDetailsService.getWalls();
          this.otherPlayers = this.gameDetailsService.getOtherPlayers();
        }
      });
  }

  private setOtherPlayersUpdateSubscription() {
    this.serverConnectionService.getOtherPlayerInfoEmitter()
      .subscribe((otherPlayerInfo: PlayerDetailsModel) => {
        this.otherPlayers.filter(player => player.inGameId === otherPlayerInfo.inGameId).forEach(it => {
          it.x = otherPlayerInfo.x;
          it.y = otherPlayerInfo.y;
          it.alive = otherPlayerInfo.alive;
        });
      });
  }

  private setPlayerUpdateSubscription() {
    this.serverConnectionService.getPlayerInfoEmitter()
      .subscribe((playerInfo: PlayerDetailsModel) => {
        this.player.x = playerInfo.x;
        this.player.y = playerInfo.y;
        this.player.alive = playerInfo.alive;
        this.player.speed = playerInfo.speed;
        this.player.bombPusher = playerInfo.bombPusher;
        this.player.bombLimit = playerInfo.bombLimit;
      });
  }

  private setNewBombsSubscription() {
    this.serverConnectionService.getNewBombEmitter()
      .subscribe((bomb: BombModel) => {
        this.setNotOwnBomb(bomb);
      });
  }

  private setRejectedBombsSubscription() {
    this.serverConnectionService.getRejectedBombEmitter()
      .subscribe((bomb: BombModel) => {
        this.removeBombIfItsPlayer(bomb.x, bomb.y);
      });
  }

  private removeBombIfItsPlayer(x: number, y: number): boolean {
    let indexOfBombToRemove = this.bombsUnderPlayer.findIndex(it => it.x === x && it.y === y);
    if (indexOfBombToRemove !== -1) {
      this.bombsUnderPlayer.splice(indexOfBombToRemove, 1);
      return true;
    } else {
      indexOfBombToRemove = this.playerBombs.findIndex(it => it.x === x && it.y === y);
      if (indexOfBombToRemove !== -1) {
        this.playerBombs.splice(indexOfBombToRemove, 1);
        return true;
      }
    }
    return false;
  }

  private removeBomb(x: number, y: number) {
    if (this.removeBombIfItsPlayer(x, y) === true) return;

    let indexOfBombToRemove = this.bombs.findIndex(it => it.x === x && it.y === y);
    if (indexOfBombToRemove !== -1) {
      this.bombs.splice(indexOfBombToRemove, 1);
    }
  }

  private setBombExplodedSubscription() {
    this.serverConnectionService.getBombExplodedEmitter()
      .subscribe((bombExplodedModel: BombExplodedModel) => {
        bombExplodedModel.removedFragileWalls.forEach(fragileWall => this.removeFragileWall(fragileWall));
        bombExplodedModel.removedBonuses.forEach(bonus => this.removeBonus(bonus));
        bombExplodedModel.removedBombs.forEach((bomb => this.removeBomb(bomb.x, bomb.y)));
        bombExplodedModel.newBonuses.forEach((bonus: TileModel) => this.bonuses.push(bonus));
        this.addFlames(bombExplodedModel.flames);
      });
  }

  private removeFragileWall(fragileWall: TileModel) {
    let indexOfWallToRemove = this.walls.findIndex(it => it.id === fragileWall.id);
    if (indexOfWallToRemove != -1) {
      this.walls.splice(indexOfWallToRemove, 1);
    }
  }

  private removeBonus(bonus: TileModel) {
    let indexOfBonusToRemove = this.bonuses.findIndex(it => it.id === bonus.id);
    if (indexOfBonusToRemove != -1) {
      this.bonuses.splice(indexOfBonusToRemove, 1);
    }
  }

  private setPickedBonusSubscription() {
    this.serverConnectionService.getPickedBonusEmitter()
      .subscribe((bonus: TileModel) => this.removeBonus(bonus));
  }

  private addFlames(flames: TileModel[]) {
    this.flames.push({
      flames: flames,
      frameNumber: 0
    } as FlamesModel)
  }
}
