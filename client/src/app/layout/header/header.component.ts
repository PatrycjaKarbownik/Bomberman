import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccessToken } from '@app/core/storages/access-token.storage';
import { RefreshToken } from '@app/core/storages/refresh-token.storage';
import { Username } from '@app/core/storages/user-details.storage';

// bar on view top -> shows username and gives logout option
@Component({
  selector: 'bomb-header',
  templateUrl: './header.component.pug',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @AccessToken() private accessToken: string;
  @RefreshToken() private refreshToken: string;
  @Username() private username: string;

  constructor(private router: Router) { }

  logout() {
    // todo: send info to overseer about logout
    this.accessToken = null;
    this.refreshToken = null;
    this.router.navigateByUrl('auth').then(() => location.reload());
  }
}
