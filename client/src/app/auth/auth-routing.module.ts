import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from '@app/auth/login/login.component';
import { ViewModel } from '@app/core/navigation/view.model';

// routing for login module - it has only one component
const routes: Routes = [
  { path: '', redirectTo: ViewModel.LOGIN, pathMatch: 'full' },
  { path: ViewModel.LOGIN, component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
