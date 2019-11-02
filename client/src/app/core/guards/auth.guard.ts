import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthToken } from '@app/core/storages/auth-token.storage';

@Injectable()
export class AuthGuard implements CanActivate {

  @AuthToken()
  private token: string;

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    if (this.token) return true;

    return this.router.navigateByUrl('auth/login').then(() => false);
  }
}

