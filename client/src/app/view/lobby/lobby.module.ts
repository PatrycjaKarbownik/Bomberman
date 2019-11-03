import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';
import { LobbyComponent } from '@app/view/lobby/lobby.component';
import { LobbyRoutingModule } from '@app/view/lobby/lobby-routing.module';

@NgModule({
  declarations: [
    LobbyComponent
  ],
  imports: [
    SharedModule,
    LobbyRoutingModule
  ],
  providers: []
})
export class LobbyModule { }
