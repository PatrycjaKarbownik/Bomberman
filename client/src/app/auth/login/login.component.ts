import { Component, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthToken } from '@app/core/storages/auth-token.storage';
import { AuthService } from '@app/auth/auth.service';

@Component({
  selector: 'bomb-login',
  templateUrl: './login.component.pug',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  private static readonly USER_EXISTS_ERR_CODE = 'USER_EXISTS';

  @AuthToken()
  private authToken: string;
  @ViewChild('login') loginModel: NgModel;

  username: string = null;
  userExistsErrorMessage: string;

  constructor(private auth: AuthService, private router: Router) {  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.auth.login(this.username)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.error.code === LoginComponent.USER_EXISTS_ERR_CODE) {
            this.loginModel.control.setErrors({userExists: true});
            this.userExistsErrorMessage = err.error.message;
          }
          return throwError(err);
        })
      )
      .subscribe(() => {
        if (this.authToken) {
          this.router.navigateByUrl('');
        }/* else {
          this.router.navigateByUrl('auth/verify-pin', { state: { credentials: this.credentials } });
        }*/
      });
  }
}
