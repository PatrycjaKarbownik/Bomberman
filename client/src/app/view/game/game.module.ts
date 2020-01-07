import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { MatchComponent } from '@app/view/game/match/match.component';
import { GameResultComponent } from '@app/view/game/game-result/game-result.component';
import { GameRoutingModule } from '@app/view/game/game-routing.module';

@NgModule({
  declarations: [
    MatchComponent,
    GameResultComponent
  ],
  imports: [
    SharedModule,
    GameRoutingModule
  ]
})
export class GameModule { }
