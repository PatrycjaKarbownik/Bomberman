import { Inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AccessToken } from '@app/core/storages/access-token.storage';
import { AuthService } from '@app/auth/auth.service';
import { ErrorType } from '@app/core/error/error-type';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private static readonly ACCESS_TOKEN_EXPIRED_ERR_CODE = 'ACCESS_TOKEN_EXPIRED';
  private static readonly REFRESH_TOKEN_EXPIRED_ERR_CODE = 'REFRESH_TOKEN_EXPIRED';

  @AccessToken() private accessToken: string;

  constructor(@Inject('BASE_API_URL') private baseUrl: string,
              private toastr: ToastrService,
              private router: Router,
              private modal: NgbModal,
              private authService: AuthService) { }

  // handle exceptions triggered by tokens expiration
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.addAuthToken(req))
      .pipe(
        catchError((response: HttpErrorResponse) => {
          if (response.error.type === ErrorType.AUTH) {
            if (response.error.code === JwtInterceptor.ACCESS_TOKEN_EXPIRED_ERR_CODE) {
              return this.handleAccessTokenExpiredException(req, next);
            } else if (response.error.code === JwtInterceptor.REFRESH_TOKEN_EXPIRED_ERR_CODE) {
              return this.handleRefreshTokenExpiredException(response);
            } else {
              return throwError(response);
            }
          } else {
            return throwError(response);
          }
        })
      );
  }

  private addAuthToken(request: HttpRequest<any>): HttpRequest<any> {
    // check if request is not a auth 'type', because auth requests haven't have an access token
    return request.url.startsWith(this.baseUrl) && !request.url.startsWith(`${this.baseUrl}/auth`)?
      request.clone({setHeaders: {Authorization: this.accessToken || ''}}) : request;
  }

  // when access token expired, try to renew it using refresh token
  private handleAccessTokenExpiredException(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.renewalToken()
      .pipe(
        mergeMap(() => next.handle(this.addAuthToken(req)))
      );
  }

  // when refresh token expired, close all opened modals
  private handleRefreshTokenExpiredException(response: HttpErrorResponse) {
    this.modal.dismissAll();
    return throwError(response);
  }
}
