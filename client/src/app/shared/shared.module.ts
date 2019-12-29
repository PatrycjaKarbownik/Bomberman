import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TextMaskModule } from 'angular2-text-mask';

import { BootstrapModule } from '@app/shared/bootstrap.module';
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
    TextMaskModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    BootstrapModule,
    NgxDatatableModule,
    NgSelectModule,
    TextMaskModule,
    ReactiveFormsModule,

    ...components
  ],
  providers: [ ]
})
export class SharedModule { }
