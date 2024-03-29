import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { first, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AccessToken } from '@app/core/storages/access-token.storage';
import { RefreshToken } from '@app/core/storages/refresh-token.storage';
import { UserId, Username } from '@app/core/storages/user-details.storage';

// service using to login to app
@Injectable()
export class AuthService {
  private static readonly userUrl = 'user';

  @AccessToken() private accessToken: string;
  @RefreshToken() private refreshToken: string;
  @Username() private username: string;
  @UserId() private userId: number;

  constructor(private httpClient: HttpClient) { }

  // send log in request
  // set access and refresh token received in response
  login(username: string): Observable<any> {
    return this.httpClient.post('auth/login', {username: username}, {observe: 'response'})
      .pipe(
        first(),
        tap(response => {
          this.accessToken = response.body.accessToken;
          this.refreshToken = response.body.refreshToken;
          this.username = response.body.username;
          this.userId = response.body.userId;
        }),
      );
  }

  // renew access token when expired
  renewalToken(): Observable<any> {
    return this.httpClient.post('auth/refresh', null, {headers: {Authorization: this.refreshToken}, observe: 'response'})
      .pipe(
        first(),
        tap(response => {
          this.accessToken = response.body.accessToken;
        }),
      );
  }

  ifUsernameExists(username: string): Observable<boolean> {
    return this.httpClient.get<boolean>(`${AuthService.userUrl}/exists/${username}`)
      .pipe(first());
  }
}
