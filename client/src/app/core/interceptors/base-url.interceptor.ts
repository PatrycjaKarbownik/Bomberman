import { Inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';

// primary http interceptor
// it add base url ('api') to urls using in requests
// and send them
@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

  private readonly IGNORE_URLS = ['./assets/i18n/pl.json'];

  constructor(@Inject('BASE_API_URL') private baseUrl: string) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req;

    if (!this.isIgnoreUrl(req.url)) request = request.clone({ url: `${this.baseUrl}/${req.url}` });

    return next.handle(request);
  }

  private isIgnoreUrl(urlToSkip: string): boolean {
    return this.IGNORE_URLS.some(url => url.includes(urlToSkip));
  }
}
