import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewModel } from '@app/core/navigation/view.model';
import { MatchComponent } from '@app/view/game/match/match.component';
import { GameResultComponent } from '@app/view/game/game-result/game-result.component';

const routes: Routes = [
  { path: '', component: MatchComponent },
  { path: ViewModel.GAME_RESULT, component: GameResultComponent },
  { path: ViewModel.MATCH, component: MatchComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule {}
