import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AccessToken } from '@app/core/storages/access-token.storage';

// protect against not logged users
@Injectable()
export class AuthGuard implements CanActivate {

  @AccessToken()
  private token: string;

  constructor(private router: Router) { }

  // check if user has a valid token, otherwise navigate him to login view
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    if (this.token) return true;

    return this.router.navigateByUrl('auth/login').then(() => false);
  }
}

