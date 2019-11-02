import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'bomb-lobby',
  templateUrl: './lobby.component.pug',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('lobby');
  }

}
