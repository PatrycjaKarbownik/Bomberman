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
        self.session_id = None  # Session ID used by socketio
        self.ready_to_game = False  # Ready for game

        # Using flask-jwt-extended was not as good idea as we first thought. It became a little problematic when we
        # tried to introduce websockets and tcpsockets and authorize those using jwt tokens. As far as I know there
        # is no good way of authorizing it using flask-jwt-extended outsite of http requests (like mentioned sockets)
        # therefore we'll stick for now with temporary solution which is just keeping actual tokens inside of User
        # object and checking if they match with what user sends us through socket
        # TODO Check expiration date of tokens when using them
        self.access_token = None
        self.refresh_token = None

    def switch_readiness(self):
        self.ready_to_game = not self.ready_to_game
        if self.room is not None:
            self.room.check_readiness()

    def serialize(self):
        return {
            'name': self.name,
            'id': self.id,
            'readyToGame': self.ready_to_game
        }
