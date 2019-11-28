import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { first, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AccessToken } from '@app/core/storages/access-token.storage';
import { RefreshToken } from '@app/core/storages/refresh-token.storage';

// service using to login to app
@Injectable()
export class AuthService {
  private static readonly userUrl = 'user';

  @AccessToken() private accessToken: string;
  @RefreshToken() private refreshToken: string;

  constructor(private httpClient: HttpClient) { }

  // send log in request
  // set auth and refresh token, which receives in response
  login(username: string): Observable<any> {
    return this.httpClient.post('auth/login', {username: username}, {observe: 'response'})
      .pipe(
        first(),
        tap(response => {
          this.accessToken = response.body.accessToken;
          this.refreshToken = response.body.refreshToken;
        }),
      );
  }

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
