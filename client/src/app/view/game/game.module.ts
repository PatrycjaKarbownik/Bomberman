import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { GameComponent } from '@app/view/game/game/game.component';
import { GameResultComponent } from '@app/view/game/game-result/game-result.component';
import { GameRoutingModule } from '@app/view/game/game-routing.module';

@NgModule({
  declarations: [
    GameComponent,
    GameResultComponent
  ],
  imports: [
    SharedModule,
    GameRoutingModule
  ]
})
export class GameModule { }
