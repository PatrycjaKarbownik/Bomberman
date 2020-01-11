import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';
import { GameResultComponent } from '@app/view/game/game-result/game-result.component';
import { GameRoutingModule } from '@app/view/game/game-routing.module';
import { GameViewComponent } from '@app/view/game/game-view/game-view.component';
import { MatchComponent } from '@app/view/game/game-view/match/match.component';

@NgModule({
  declarations: [
    GameResultComponent,
    MatchComponent,
    GameViewComponent
  ],
  imports: [
    SharedModule,
    GameRoutingModule
  ]
})
export class GameModule { }
