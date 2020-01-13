import { Injectable } from '@angular/core';
import { GameDetailsService } from '@app/view/game/game-view/game-details.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { MessageModel } from '@app/view/game/game-view/server-connection/message.model';
import { MessageType } from '@app/view/game/game-view/server-connection/message-type';
import { Username } from '@app/core/storages/user-details.storage';
import { AccessToken } from '@app/core/storages/access-token.storage';

@Injectable({
  providedIn: 'root'
})
export class ServerConnectionService {

  @Username() username;
  @AccessToken() accessToken;

  private gamehostSocket: WebSocketSubject<{}>;

  constructor(private gameDetailsService: GameDetailsService) {
    this.gamehostSocket = gameDetailsService.getGamehostSocket();
    this.sendAuthorizationMessage();
    this.gamehostSocket.asObservable().subscribe(data => {
        let messageData = data;
        console.log(messageData);
      }
    );
  }

  private sendAuthorizationMessage() {
    this.gamehostSocket.next({
      messageType: MessageType.AUTHORIZATION,
      content: {
        jwtToken: this.accessToken,
        username: this.username
      }
    } as MessageModel);
  }

  /*newMessage() {
    console.log(this.counter);
    this.gamehostSocket.next({msg: `Test message ${this.counter}`});
    this.counter++;
  }*/
}
