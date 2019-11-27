import { Inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthToken } from '@app/core/storages/auth-token.storage';
import { AuthService } from '@app/auth/auth.service';
import { ErrorType } from '@app/core/error/error-type';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private static readonly AUTH_TOKEN_EXPIRED_ERR_CODE = 'ACCESS_TOKEN_EXPIRED';

  @AuthToken() private authToken: string;

  constructor(@Inject('BASE_API_URL') private baseUrl: string,
              private toastr: ToastrService,
              private router: Router,
              private modal: NgbModal,
              private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.addAuthToken(req))
      .pipe(
        catchError((response: HttpErrorResponse) => {
          if (response.error.type === ErrorType.AUTH) {
            if (response.error.code === JwtInterceptor.AUTH_TOKEN_EXPIRED_ERR_CODE) {
              return this.handleTokenExpiredException(req, next);
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
    return request.url.startsWith(this.baseUrl) ?
      request.clone({setHeaders: {Authorization: this.authToken || ''}}) : request;
  }

  private handleTokenExpiredException(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.renewalToken()
      .pipe(
        mergeMap(() => next.handle(this.addAuthToken(req)))
      );
  }
}
