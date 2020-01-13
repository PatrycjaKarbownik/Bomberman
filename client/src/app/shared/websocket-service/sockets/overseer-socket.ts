import { Socket } from 'ngx-socket-io';
import { overseerIP } from '@app/shared/configuration';

export class OverseerSocket extends Socket {
  constructor() {
    super({
      url: `http://${overseerIP}`,
      options: {
        transports: [/*'websocket', */'polling'], // todo: do websocket transport working
        autoConnect: false
      }
    });
  }
}
