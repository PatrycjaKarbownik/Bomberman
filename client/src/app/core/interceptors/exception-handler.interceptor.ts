import { Inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ExceptionHandlerInterceptor implements HttpInterceptor {

  constructor(private toastr: ToastrService,
              private translate: TranslateService,
              private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(
        catchError((response: HttpErrorResponse) => {
          if (response.status === 401) {
            this.router.navigateByUrl('auth');
            this.toastr.error(this.translate.instant(response.error.message));
          } else if (!response.error.message) {
            this.toastr.error(this.translate.instant('EXCEPTION.UNEXPECTED'));
          } else {
              this.toastr.error(response.error.message);
          }
          return throwError(response);
        })
      );
  }
}
