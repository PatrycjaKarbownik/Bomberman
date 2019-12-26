import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  messages = this.overseerSocket.fromEvent<string[]>('getMessages');
  private counter = 1;

  constructor(private overseerSocket: Socket) { }

  newMessage() {
    console.log(this.counter);
    this.overseerSocket.emit('sendMessage', {msg: `Test message ${this.counter}`});
    this.counter++;
  }
}
