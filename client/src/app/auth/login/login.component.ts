import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import { AccessToken } from '@app/core/storages/access-token.storage';
import { AuthService } from '@app/auth/auth.service';

// login view
// it will be shown when user won't be logged
@Component({
  selector: 'bomb-login',
  templateUrl: './login.component.pug',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private static readonly MIN_USERNAME_LENGTH = 3;
  private messages: Observable<string[]>;

  @AccessToken() private accessToken: string;
  loginModel: FormGroup = this.buildLoginForm();

  private debouncer: any;

  constructor(private authService: AuthService,
              private formBuilder: FormBuilder, private router: Router) {

  }

  ngOnInit() {
    this.loginModel = this.buildLoginForm();
  }

  // execute after login button click
  // send log in request to overseer
  // check errors in response
  // and navigate to lobby view, when receive access token
  onSubmit() {
    if (this.loginModel.invalid) return;

    this.authService.login(this.username.value)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status == 401) {
            this.username.setErrors({userExists: true});
          }
          return throwError(err);
        })
      )
      .subscribe(() => {
        if (this.accessToken) {
          this.router.navigateByUrl('');
        }
      });
  }

  get username(): AbstractControl {
    return this.loginModel.get('username');
  }

  // creates form to login;
  // checks if typed username exists (in real-time)
  private buildLoginForm(): FormGroup {
    return this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(LoginComponent.MIN_USERNAME_LENGTH)
      ],
        this.isUsernameUnique.bind(this) // async Validator passed as 3rd parameter
      ]
    });
  }

  // username exists validator
  private isUsernameUnique(control: AbstractControl) {
    clearTimeout(this.debouncer);

    return new Promise((resolve, reject) => {
      this.debouncer = setTimeout(() => {
        this.authService.ifUsernameExists(control.value).subscribe(exists => {
          if (!exists) {
            resolve(null);
          } else {
            resolve({'usernameExists': true});
          }
        });
      }, 200);
    });
  }


  sendMessage() {
    this.authService.sendMsg();
  }
}
