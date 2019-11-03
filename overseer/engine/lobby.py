import logging

from engine.user import *

users = dict()
# Number of next not taken user id, -1 means error
free_id = 0

logger = logging.getLogger(__name__)


def get_users():
    """Return list of all logged users"""
    return users


def user_exists(nickname):
    """Return True if nickname is taken, otherwise False"""
    for user in users:
        if user['name'] == nickname:
            return True

    return False


def add_user(username):
    """Adds user to list of users if username is unique and returns it's id"""
    global free_id
    if user_exists(username):
        return -1
    new_user = User
    new_user.name = username
    new_user.id = free_id
    free_id += 1
    new_user.state = UserState.IN_LOBBY
