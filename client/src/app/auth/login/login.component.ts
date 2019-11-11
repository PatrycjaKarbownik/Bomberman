import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, NgForm, NgModel, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthToken } from '@app/core/storages/auth-token.storage';
import { AuthService } from '@app/auth/auth.service';

// login view
// it will be shown when user won't be logged
@Component({
  selector: 'bomb-login',
  templateUrl: './login.component.pug',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private static readonly USER_EXISTS_ERR_CODE = 'USER_EXISTS';

  @AuthToken()
  private authToken: string;
  // @ViewChild('login') loginModel: NgModel;
  // @ViewChild('loginForm')
  myForm: FormGroup = this.buildForm();

  debouncer: any;

  username: string = null;
  userExistsErrorMessage: string;

  constructor(private authService: AuthService,
              private formBuilder: FormBuilder, private router: Router) {
    // this.buildForm();
  }

  ngOnInit() {
    this.myForm = this.buildForm();
  }

  // execute after login button click
  // send log in request to overseer
  // check errors in response
  // and navigate to lobby view, when receive auth token
  onSubmit(/*form: NgForm*/) {
    //if (this.form.invalid) return;

    this.username = this.myForm.get('username').value;

    this.authService.login(this.username)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.error.code === LoginComponent.USER_EXISTS_ERR_CODE) {
            // this.loginModel.control.setErrors({userExists: true});
            this.myForm.get('username').setErrors({userExists: true});
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

  private buildForm(): FormGroup {
    return this.formBuilder.group({
      'username': ['', [
        Validators.required,
        Validators.minLength(3)
      ],
        this.isUsernameUnique.bind(this) // async Validator passed as 3rd parameter
      ]
    });
  }

  private isUsernameUnique(control: AbstractControl) {
    clearTimeout(this.debouncer);

    return new Promise((resolve, reject) => {
      this.debouncer = setTimeout(() => {
        this.authService.ifUsernameExists(control.value).subscribe(exists => {
          console.log('check');
          if (!exists) {
            resolve(null);
          } else {
            resolve({'usernameExists': true});
          }
        });
      }, 200);
    });
  }
}
