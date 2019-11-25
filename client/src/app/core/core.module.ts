import { LOCALE_ID, NgModule, Optional, SkipSelf } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';

import { ToastrModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AuthGuard } from '@app/core/guards/auth.guard';
import { BaseUrlInterceptor } from '@app/core/interceptors/base-url.interceptor';
import { ExceptionHandlerInterceptor } from '@app/core/interceptors/exception-handler.interceptor';
import { AuthService } from '@app/auth/auth.service';
import { JwtInterceptor } from '@app/core/interceptors/jwt.interceptor';

// module including primary modules
// which have to be imported by app module

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

registerLocaleData(localePl, 'pl');

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ToastrModule.forRoot({
      preventDuplicates: true,
      positionClass: 'toast-bottom-right'
    })
  ],
  providers: [
    AuthGuard,
    AuthService,
    { provide: 'BASE_API_URL', useValue: 'api' },
    { provide: 'DATE_FORMAT', useValue: 'YYYY-MM-DD' },
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ExceptionHandlerInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'pl' }
  ],
  exports: [
    HttpClientModule
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) throw new Error('CoreModule is already loaded. Import only in AppModule');
  }
}
