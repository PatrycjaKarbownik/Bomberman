import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccessToken } from '@app/core/storages/access-token.storage';
import { RefreshToken } from '@app/core/storages/refresh-token.storage';
import { UserId, Username } from '@app/core/storages/user-details.storage';
import { WebsocketService } from '@app/shared/websocket-service/websocket.service';

// bar on view top -> shows username and gives logout option
@Component({
  selector: 'bomb-header',
  templateUrl: './header.component.pug',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @AccessToken() private accessToken: string;
  @RefreshToken() private refreshToken: string;
  @UserId() private userId: number;
  @Username() private username: string;

  constructor(private router: Router, private websocketService: WebsocketService) { }

  logout() {
    this.websocketService.overseerDisconnect();
    this.accessToken = null;
    this.refreshToken = null;
    this.userId = null;
    this.username = null;
    this.router.navigateByUrl('auth').then(() => location.reload());
  }
}
