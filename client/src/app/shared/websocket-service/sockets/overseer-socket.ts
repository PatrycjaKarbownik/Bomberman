import { Socket } from 'ngx-socket-io';
import { CurrentUserService } from '@app/shared/auth/current-user.service';

export class OverseerSocket extends Socket {
  constructor(private userId: number/*private accessToken: String*/) {
    super({
      url: 'http://localhost:5000',
      options: {
        transports: [/*'websocket', */'polling'],
        autoConnect: false,
        query: {'userId': 6}
      }
    });
  }
}
