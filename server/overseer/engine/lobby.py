import logging

from engine.host_manager import host_manager
from engine.id_manager import IdManager
from engine.room import Room
from engine.user import *

logger = logging.getLogger(__name__)


class Lobby:

    def __init__(self):
        self.users = dict()  # Dict of User objects mapped by id
        self.rooms = dict()  # Dict of Room objects mapped by id
        self.user_id_manager = IdManager()
        self.room_id_manager = IdManager()
        self.socketio = None

    def user_exists(self, username):
        """Return True if username is taken, otherwise False"""
        for user in self.users.values():
            if user.name == username:
                return True

        return False

    def room_exists(self, room_id):
        """Return True if room with given id exists, otherwise False"""
        if room_id in self.rooms:
            return True

        return False

    def add_user(self, username):
        """Adds user to list of users if username is unique and returns it's id"""
        if self.user_exists(username):
            return -1
        new_user = User()
        new_user.name = username
        new_user.id = self.user_id_manager.get_id()
        new_user.state = UserState.IN_LOBBY
        self.users[new_user.id] = new_user
        return new_user.id

    def remove_user(self, user_id):
        """Removes user from lobby.

        Returns:
            False if user was not present, otherwise True
        """
        user = self.users.pop(user_id)

        if user is None:
            return False

        if user.room is not None:
            room = lobby.rooms.get(user.room)
            if room is not None:
                room.remove_user(user.id)

        return True

    def get_user_by_name(self, name):
        """Returns user with given name or None"""
        for user in self.users.values():
            if user.name == name:
                return user

        return None

    def authorize_user(self, jwt_token, username):
        user = self.get_user_by_name(username)
        if user is None:
            return False
        else:
            if user.access_token == jwt_token:
                return True
            else:
                return False

    def create_room(self):
        """Creates room and returns it's id"""
        new_room = Room()
        new_room.id = self.room_id_manager.get_id()
        self.rooms[new_room.id] = new_room
        new_room.subscribe(self)
        return new_room.id

    def remove_room(self, room_id):
        """Removes room with given id, if present returns True, otherwise False"""
        room = self.rooms.pop(room_id)

        if room is None:
            return False

        return True

    def send_port(self, room, port):
        """Sends port for game to players in room"""
        assumed_room = self.rooms.get(room.id)
        # check if room still exists
        if assumed_room != room:
            return

        socketio_room_name = 'room_{}'.format(room.id)
        lobby.socketio.emit('port_ready', port, room=socketio_room_name)
        print('sending info of port {} to room {}'.format(port, room.id))

    def notify(self, class_notifying, class_instance):
        """Used to notify lobby about events by classes which it subscribed

        """
        if class_notifying is Room:
            if class_instance.empty():
                self.remove_room(class_instance.id)
                return
            if class_instance.all_ready():
                host_manager.send_create_room_request(class_instance)
                return

    def get_json_rooms(self, only_usernames=True):
        """Returns JSON string with all rooms

        Args:
            only_usernames: Argument of serialize method of Room class. If set to true users in room will be serialized
            only as their names and not as a whole objects (they won't have their id or theirs room id)
        """
        return [room.serialize(only_usernames) for room in self.rooms.values()]


#  For now in order to use same object in both static and non static modules object of Lobby class is created here
#  ready to be imported to other modules. It is left to decide later if this is good solution to the problem of
#  sharing object or not.
lobby = Lobby()

# TODO Test data delete later

lobby.add_user("Jack")
lobby.add_user("Matty")
lobby.add_user("Patrice")
lobby.add_user("Bastian")
lobby.add_user("GuyWhoKnowsAGuy")
lobby.add_user("xXx__DeStRoYeR_PL__xXx")

lobby.create_room()
lobby.create_room()

roomA = lobby.rooms.get(0)
roomB = lobby.rooms.get(1)

roomA.add_user(lobby.users.get(0))
roomA.add_user(lobby.users.get(2))
roomB.add_user(lobby.users.get(3))
