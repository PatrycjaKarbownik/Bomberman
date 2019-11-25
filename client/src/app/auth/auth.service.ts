import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { first, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AuthToken } from '@app/core/storages/auth-token.storage';
import { RefreshToken } from '@app/core/storages/refresh-token.storage';

// service using to login to app
@Injectable()
export class AuthService {
  private static readonly userUrl = 'user';

  @AuthToken() private authToken: string;
  @RefreshToken() private refreshToken: string;

  constructor(private httpClient: HttpClient) { }

  // send log in request
  // set auth and refresh token, which receives in response
  login(username: string): Observable<any> {
    return this.httpClient.post('auth/login', {username: username}, {observe: 'response'})
      .pipe(
        first(),
        tap(response => {
          this.authToken = response.body.accessToken;
          this.refreshToken = response.body.refreshToken;
        }),
      );
  }

  ifUsernameExists(username: string): Observable<boolean> {
    return this.httpClient.get<boolean>(`${AuthService.userUrl}/exists/${username}`)
      .pipe(first());
  }
}
