import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';
import { RoomComponent } from '@app/view/room/room.component';
import { RoomRoutingModule } from '@app/view/room/room-routing.module';

@NgModule({
  declarations: [RoomComponent],
  imports: [
    SharedModule,
    RoomRoutingModule
  ]
})
export class RoomModule { }
