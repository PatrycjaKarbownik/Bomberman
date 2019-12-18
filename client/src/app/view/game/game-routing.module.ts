import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewModel } from '@app/core/navigation/view.model';
import { GameComponent } from '@app/view/game/game/game.component';
import { GameResultComponent } from '@app/view/game/game-result/game-result.component';

const routes: Routes = [
  { path: '', component: GameComponent },
  { path: ViewModel.GAME_RESULT, component: GameResultComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule {}
