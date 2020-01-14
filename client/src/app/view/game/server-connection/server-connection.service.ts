import { EventEmitter, Injectable } from '@angular/core';

import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { MessageModel } from '@app/view/game/server-connection/models/message.model';
import { MessageType } from '@app/view/game/server-connection/models/message-type';
import { Username } from '@app/core/storages/user-details.storage';
import { AccessToken } from '@app/core/storages/access-token.storage';
import { WebsocketService } from '@app/shared/websocket-service/websocket.service';
import { gamehostIP } from '@app/shared/ip-configuration';
import { TileModel } from '@app/view/game/game-view/models/tile.model';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';
import { RequestType } from '@app/view/game/server-connection/models/request-type';
import { BombModel } from '@app/view/game/game-view/models/bomb.model';
import { BombExplodedModel } from '@app/view/game/server-connection/models/bomb-exploded.model';
import { UserResultModel } from '@app/view/game/server-connection/models/user-result.model';

// service only for communication with game server
// and information transfer to another components
@Injectable({
  providedIn: 'root'
})
export class ServerConnectionService {

  @Username() username;
  @AccessToken() accessToken;

  // parameters used to sending request to server
  private actualRequestId = 0;
  private lastReviewedId = 0;

  // information transmitters
  private gameHostSocket: WebSocketSubject<{}>;
  private gameStartedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  private mapInfoEmitter: EventEmitter<TileModel[]> = new EventEmitter<TileModel[]>();
  private initialPlayersInfoEmitter: EventEmitter<PlayerDetailsModel[]> = new EventEmitter<PlayerDetailsModel[]>();
  private otherPlayerInfoEmitter: EventEmitter<PlayerDetailsModel> = new EventEmitter<PlayerDetailsModel>();
  private playerInfoEmitter: EventEmitter<PlayerDetailsModel> = new EventEmitter<PlayerDetailsModel>();
  private newBombEmitter: EventEmitter<BombModel> = new EventEmitter<BombModel>();
  private rejectedBombEmitter: EventEmitter<BombModel> = new EventEmitter<BombModel>();
  private bombExplodedEmitter: EventEmitter<BombExplodedModel> = new EventEmitter<BombExplodedModel>();
  private pickedBonusEmitter: EventEmitter<TileModel> = new EventEmitter<TileModel>();
  private gameResultEmitter: EventEmitter<UserResultModel[]> = new EventEmitter<UserResultModel[]>();

  private gameResult: UserResultModel[];

  constructor(private websocketService: WebsocketService) {
    this.gameHostSocket = webSocket(`ws://${gamehostIP}:${websocketService.port}`);

    this.sendAuthorizationMessage();
    this.listenGameHostSocket();
  }

  private listenGameHostSocket() {
    this.gameHostSocket.asObservable().subscribe(data => {
        let messageData = data as MessageModel;
        console.log(messageData);

        if (messageData.messageType === MessageType.MAP_INFO) {
          this.emitMapInfo(messageData.content);
        } else if (messageData.messageType === MessageType.INITIAL_PLAYERS_INFO) {
          this.emitPlayersInfo(messageData.content);
        } else if (messageData.messageType === MessageType.START) {
          this.emitStartGame();
        } else if (messageData.messageType === MessageType.OTHER_PLAYER_UPDATE) {
          this.emitOtherPlayerInfo(messageData.content);
        } else if (messageData.messageType === MessageType.PLAYER_UPDATE) {
          this.emitPlayerInfo(messageData.content);
        } else if (messageData.messageType === MessageType.LAST_REQUEST) {
          this.lastReviewedId = messageData.content;
        } else if (messageData.messageType === MessageType.BOMB_PLACED) {
          this.emitNewBomb(messageData.content);
        } else if (messageData.messageType === MessageType.BOMB_REJECTED) {
          this.emitRejectedBomb(messageData.content);
        } else if (messageData.messageType === MessageType.BOMB_EXPLODED) {
          this.emitBombExploded(messageData.content);
        } else if (messageData.messageType === MessageType.BONUS_PICKED_UP) {
          this.emitPickedBonus(messageData.content);
        } else if (messageData.messageType === MessageType.GAME_RESULT) {
          this.gameResult = messageData.content;
          this.emitGameResult(messageData.content);
        }
      }
    );
  }

  private sendAuthorizationMessage() {
    this.gameHostSocket.next({
      messageType: MessageType.AUTHORIZATION,
      content: {
        jwtToken: this.accessToken,
        username: this.username
      }
    } as MessageModel);
  }

  sendMoveRequest(x: number, y: number) {
    this.sendRequest(RequestType.MOVE, [`${x}`, `${y}`]);
  }

  sendBombRequest(x: number, y: number) {
    this.sendRequest(RequestType.BOMB, [`${x}`, `${y}`]);
  }

  private sendRequest(requestType: RequestType, additionalInfo: string[]) {
    let request = `RQ_${requestType}_${this.actualRequestId}_${this.lastReviewedId}`;

    additionalInfo.forEach(it => request = request.concat(`_${it}`));

    this.gameHostSocket.next(request);
    this.actualRequestId += 1;
  }

  getGameResult() {
    return this.gameResult;
  }

  // methods allow listen if information come by other components

  getMapInfoEmitter() {
    return this.mapInfoEmitter;
  }

  getInitialPlayersInfoEmitter() {
    return this.initialPlayersInfoEmitter;
  }

  getGameStartedEmitter() {
    return this.gameStartedEmitter;
  }

  getOtherPlayerInfoEmitter() {
    return this.otherPlayerInfoEmitter;
  }

  getPlayerInfoEmitter() {
    return this.playerInfoEmitter;
  }

  getNewBombEmitter() {
    return this.newBombEmitter;
  }

  getRejectedBombEmitter() {
    return this.rejectedBombEmitter;
  }

  getBombExplodedEmitter() {
    return this.bombExplodedEmitter;
  }

  getPickedBonusEmitter() {
    return this.pickedBonusEmitter;
  }

  getGameResultEmitter() {
    return this.gameResultEmitter;
  }

  // methods transmit information if it comes

  private emitMapInfo(mapInfo: TileModel[]) {
    this.mapInfoEmitter.emit(mapInfo);
  }

  private emitPlayersInfo(playersInfo: PlayerDetailsModel[]) {
    this.initialPlayersInfoEmitter.emit(playersInfo);
  }

  private emitStartGame() {
    this.gameStartedEmitter.emit(true);
  }

  private emitOtherPlayerInfo(otherPlayerInfo: PlayerDetailsModel) {
    this.otherPlayerInfoEmitter.emit(otherPlayerInfo);
  }

  private emitPlayerInfo(playerInfo: PlayerDetailsModel) {
    this.playerInfoEmitter.emit(playerInfo);
  }

  private emitNewBomb(bomb: BombModel) {
    this.newBombEmitter.emit(bomb);
  }

  private emitRejectedBomb(bomb: BombModel) {
    this.rejectedBombEmitter.emit(bomb);
  }

  private emitBombExploded(bombExplodedModel: BombExplodedModel) {
    this.bombExplodedEmitter.emit(bombExplodedModel);
  }

  private emitPickedBonus(bonus: TileModel) {
    this.pickedBonusEmitter.emit(bonus);
  }

  private emitGameResult(gameResult: UserResultModel[]) {
    this.gameResultEmitter.emit(gameResult);
  }
}
