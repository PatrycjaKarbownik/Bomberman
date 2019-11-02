import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainContainerComponent } from '@app/layout/main-container/main-container.component';
import { ViewModel } from '@app/core/navigation/view.model';

const routes: Routes = [
  {
    path: '', component: MainContainerComponent, children: [
      { path: '', redirectTo: ViewModel.LOBBY, pathMatch: 'full' },
      {
        path: ViewModel.LOBBY,
        loadChildren: '@app/lobby/lobby.module#LobbyModule',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {}