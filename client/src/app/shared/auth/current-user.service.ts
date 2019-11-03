import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { CurrentUserModel } from '@app/shared/auth/current-user.model';

@Injectable()
export class CurrentUserService {

  private currentUserCache$: Observable<CurrentUserModel>;

  constructor(private httpClient: HttpClient) { }

  getCurrentUser(): Observable<CurrentUserModel> {
    if (!this.currentUserCache$) {
      this.currentUserCache$ = this.httpClient.get<CurrentUserModel>('auth')
        .pipe(shareReplay(1));
    }
    return this.currentUserCache$;
  }

  isCurrentUserId(id: number): boolean {
    let result = false;
    this.getCurrentUser().subscribe(user =>
      result = (user.id === id)
    );
    return result;
  }
}
