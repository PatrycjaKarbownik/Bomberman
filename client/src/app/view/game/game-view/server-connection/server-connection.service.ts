import { EventEmitter, Injectable } from '@angular/core';

import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { MessageModel } from '@app/view/game/game-view/server-connection/message.model';
import { MessageType } from '@app/view/game/game-view/server-connection/message-type';
import { Username } from '@app/core/storages/user-details.storage';
import { AccessToken } from '@app/core/storages/access-token.storage';
import { WebsocketService } from '@app/shared/websocket-service/websocket.service';
import { gamehostIP } from '@app/shared/ip-configuration';
import { TileModel } from '@app/view/game/game-view/models/tile.model';
import { PlayerDetailsModel } from '@app/view/game/game-view/models/player-details.model';

@Injectable({
  providedIn: 'root'
})
export class ServerConnectionService {

  @Username() username;
  @AccessToken() accessToken;

  private gameHostSocket: WebSocketSubject<{}>;
  private gameStartedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  private mapInfoEmitter: EventEmitter<TileModel[]> = new EventEmitter<TileModel[]>();
  private playersInfoEmitter: EventEmitter<PlayerDetailsModel[]> = new EventEmitter<PlayerDetailsModel[]>();

  constructor(private websocketService: WebsocketService) {
    console.log('port', websocketService.port);
    this.gameHostSocket = webSocket(`ws://${gamehostIP}:${websocketService.port}`);

    this.sendAuthorizationMessage();
    this.listenGameHostSocket();
  }

  getGameHostSocket() {
    return this.gameHostSocket;
  }

  getMapInfoEmitter() {
    return this.mapInfoEmitter;
  }

  getPlayersInfoEmitter() {
    return this.playersInfoEmitter;
  }

  getGameStartedEmitter() {
    return this.gameStartedEmitter;
  }

  private listenGameHostSocket() {
    this.gameHostSocket.asObservable().subscribe(data => {
        let messageData = data as MessageModel;
        console.log(messageData);

        if (messageData.messageType === MessageType.MAP_INFO) {
          this.emitMapInfo(messageData.content);
        } else if (messageData.messageType === MessageType.PLAYER_INFO) {
          this.emitPlayersInfo(messageData.content);
        } else if (messageData.messageType === MessageType.START) {
          this.emitStartGame();
        }
      }
    );
  }

  private emitMapInfo(mapInfo: TileModel[]) {
    this.mapInfoEmitter.emit(mapInfo);
  }

  private emitPlayersInfo(playersInfo: PlayerDetailsModel[]) {
    this.playersInfoEmitter.emit(playersInfo);
  }

  private emitStartGame() {
    this.gameStartedEmitter.emit(true);
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
}
