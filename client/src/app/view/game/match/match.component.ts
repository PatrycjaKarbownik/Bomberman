import { Component, OnInit } from '@angular/core';

import { MapModel } from '@app/view/game/models/map.model';
import { GameService } from '@app/view/game/game.service';
import { TileType } from '@app/view/game/models/tile-type.model';
import { CornerType } from '@app/view/game/models/corner-type.model';

@Component({
  selector: 'bomb-match',
  templateUrl: './match.component.pug',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {

  private map: MapModel;


  TileType = TileType;
  CornerType = CornerType;

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.map = this.gameService.getMap();
  }

  getCornerType(): CornerType {
    let userInGameId = 3;

    return userInGameId % 4;
  }

}
