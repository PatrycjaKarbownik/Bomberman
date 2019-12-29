import logging

from engine.id_manager import IdManager
from engine.room import Room
from engine.user import *

logger = logging.getLogger(__name__)


class Lobby:

    def __init__(self):
        self.users = dict()  # Dict of User objects
        self.rooms = dict()  # Dict of Room objects
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
        result = self.users.pop(user_id)

        if result is None:
            return False

        if result.room is not None:
            result.room.remove_user(result.id)

        return True

    def create_room(self):
        """Creates room and returns it's id"""
        new_room = Room()
        new_room.id = self.room_id_manager.get_id()
        self.rooms[new_room.id] = new_room
        new_room.subscribe(self)
        new_room.socketio = self.socketio
        return new_room.id

    def remove_room(self, room_id):
        """Removes room with given id, if present returns True, otherwise False"""
        room = self.rooms.pop(room_id)

        if room is None:
            return False

        return True

    def notify(self, class_notifying, class_instance):
        """Used to notify lobby about events by classes which it subscribed

        """
        if class_notifying is Room:
            if class_instance.empty():
                self.remove_room(class_instance.id)

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
