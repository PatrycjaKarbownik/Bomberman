import { NgModule } from '@angular/core';

import { NgbDatepickerModule, NgbDropdownModule, NgbModalConfig, NgbModalModule, NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  exports: [
    NgbDropdownModule,
    NgbTabsetModule,
    NgbModalModule,
    NgbDatepickerModule,
    NgbDropdownModule
  ]
})
export class BootstrapModule {
  constructor(config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
}
