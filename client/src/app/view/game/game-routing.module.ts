import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewModel } from '@app/core/navigation/view.model';
import { GameResultComponent } from '@app/view/game/game-result/game-result.component';
import { GameViewComponent } from '@app/view/game/game-view/game-view.component';

const routes: Routes = [
  { path: '', component: GameViewComponent },
  { path: ViewModel.GAME_RESULT, component: GameResultComponent },
  { path: ViewModel.MATCH, component: GameViewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule {}
