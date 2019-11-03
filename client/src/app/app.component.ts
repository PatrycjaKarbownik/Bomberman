import { Component } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bomb-root',
  templateUrl: './app.component.pug',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // set language in app
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('pl');
    translate.use('pl');
  }
}
