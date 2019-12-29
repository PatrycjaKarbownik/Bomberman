import { Socket } from 'ngx-socket-io';

export class OverseerSocket extends Socket {
  constructor() {
    super({
      url: 'http://localhost:5000',
      options: {
        transports: [/*'websocket', */'polling'],
        autoConnect: false
      }
    });
  }
}
