import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';
import { LoginComponent } from '@app/auth/login/login.component';
import { AuthRoutingModule } from '@app/auth/auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    SharedModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
