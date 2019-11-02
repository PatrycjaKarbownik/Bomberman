from enum import Enum


class UserState(Enum):
    IN_GAME = "in_game"
    IN_LOBBY = "in_lobby"
    IN_ROOM = "in_room"


class User:
    name = "DefaultUser"
    id = -1
    state = UserState.IN_GAME
    room = None
