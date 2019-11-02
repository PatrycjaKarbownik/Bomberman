import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@app/core/guards/auth.guard';

const routes: Routes = [
  { path: '',
    loadChildren: '@app/main.module#MainModule'/*,
    canActivate: [AuthGuard]*/
  },
  { path: 'auth', loadChildren: '@app/auth/auth.module#AuthModule' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
