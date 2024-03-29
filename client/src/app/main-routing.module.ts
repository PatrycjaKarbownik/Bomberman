import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainContainerComponent } from '@app/layout/main-container/main-container.component';
import { ViewModel } from '@app/core/navigation/view.model';

// routing available after logging
const routes: Routes = [
  {
    path: '', component: MainContainerComponent, children: [
      { path: '', redirectTo: ViewModel.LOBBY, pathMatch: 'full' },
      {
        path: ViewModel.LOBBY,
        loadChildren: '@app/view/lobby/lobby.module#LobbyModule',
      },
      {
        path: ViewModel.ROOM + '/:roomId',
        loadChildren: '@app/view/room/room.module#RoomModule',
      },
      {
        path: ViewModel.GAME,
        loadChildren: '@app/view/game/game.module#GameModule',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {}
