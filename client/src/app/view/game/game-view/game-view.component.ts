import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'bomb-game-view',
  template: `
    <div class="col-sm-12 py-4 d-flex flex-column align-items-center">
      <div class="map">
        <bomb-match></bomb-match>
      </div>
    </div>
  `,
  styleUrls: ['./game-view.component.scss']
})
export class GameViewComponent implements OnInit {

  constructor() { }

  ngOnInit() { }
}
