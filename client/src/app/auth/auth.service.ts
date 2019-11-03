import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { first, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AuthToken } from '@app/core/storages/auth-token.storage';

// service using to login to app
@Injectable()
export class AuthService {

  @AuthToken() private authToken: string;

  constructor(private httpClient: HttpClient) { }

  // send log in request
  // set auth token, which receives in response
  login(username: string): Observable<any> {
    return this.httpClient.post('auth/login', username, { observe: 'response' }).pipe(
      first(),
      tap(resp => this.authToken = resp.headers.get('authorization')),
    );
  }
}
