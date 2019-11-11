import { UserModel } from '@app/view/room/models/user.model';

export class RoomModel {
  id: number;
  inGame: boolean;
  users: UserModel[] = [];
}
