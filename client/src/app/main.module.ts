import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';
import { MainContainerComponent } from '@app/layout/main-container/main-container.component';
import { HeaderComponent } from '@app/layout/header/header.component';
import { MainRoutingModule } from '@app/main-routing.module';
import { AuthService } from '@app/auth/auth.service';

@NgModule({
  declarations: [
    HeaderComponent,
    MainContainerComponent
  ],
  imports: [
    SharedModule,
    MainRoutingModule
  ],
  providers: [
    AuthService
  ]
})
export class MainModule { }
