import logging

from engine.id_manager import IdManager
from engine.room import Room
from engine.user import *

users = dict()
rooms = dict()
user_id_manager = IdManager()
room_id_manager = IdManager()

logger = logging.getLogger(__name__)


def user_exists(username):
    """Return True if username is taken, otherwise False"""
    for user in users:
        if user.name == username:
            return True

    return False


def add_user(username):
    """Adds user to list of users if username is unique and returns it's id"""
    if user_exists(username):
        return -1
    new_user = User
    new_user.name = username
    new_user.id = user_id_manager.get_id()
    new_user.state = UserState.IN_LOBBY


def remove_user(user_id):
    """Removes user from lobby.

    Returns:
        False if user was not present, otherwise True
    """
    result = users.pop(user_id, None)

    if result is None:
        return False

    return True


def create_room():
    """Creates room and returns it's id"""
    new_room = Room()
    new_room.id = room_id_manager.get_id()
    rooms[new_room.id] = new_room
    return new_room.id


def remove_room(room_id):
    """Removes room with given id, if present returns True, otherwise False"""
    room = rooms.pop(room_id, None)

    if room is None:
        return False

    return True


def get_json_rooms(only_usernames=True):
    """Returns JSON string with all rooms

    Args:
        only_usernames: Argument of serialize method of Room class. If set to true users in room will be serialized
        only as their names and not as a whole objects (they won't have their id or theirs room id)
    """
    test = [room.serialize(only_usernames) for room in rooms.values()]
    return str(test)
