from enum import Enum


class UserState(Enum):
    IN_GAME = "in_game"
    IN_LOBBY = "in_lobby"
    IN_ROOM = "in_room"


class User:
    
    def __init__(self):
        self.name = "DefaultUser"
        self.id = -1
        self.state = UserState.IN_GAME
        self.room = None
