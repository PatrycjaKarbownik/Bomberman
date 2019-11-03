import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TextMaskModule } from 'angular2-text-mask';

import { BootstrapModule } from '@app/shared/bootstrap.module';
import { CurrentUserService } from '@app/shared/auth/current-user.service';
import { ValidationErrorsComponent } from '@app/shared/validation/validation-errors.component';
import { ValidationErrorComponent } from '@app/shared/validation/validation-error.component';
import { PopupComponent } from '@app/shared/popup/popup.component';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';

// module which can be imported by another modules
export const components = [
  ValidationErrorsComponent,
  ValidationErrorComponent,
  PopupComponent,
  PageHeaderComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    BootstrapModule,
    NgxDatatableModule,
    NgSelectModule,
    TextMaskModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    BootstrapModule,
    NgxDatatableModule,
    NgSelectModule,
    TextMaskModule,

    ...components
  ],
  providers: [
    CurrentUserService
  ]
})
export class SharedModule { }
