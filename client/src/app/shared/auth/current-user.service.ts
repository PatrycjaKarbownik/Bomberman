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
      this.currentUserCache$ = this.httpClient.get<CurrentUserModel>('user/current_user')
        .pipe(shareReplay(1));
    }
    return this.currentUserCache$;
  }

  getCurrentUserId(): number {
    let id;
    this.getCurrentUser().subscribe(response => {
      id = response.id;
    });

    return id;
  }
}
