import json
import logging

logger = logging.getLogger(__name__)
logged_users = json.load(open('mock_data/users.json', 'r'))

def get_users():
    """Return list of all logged users"""
    return logged_users
    pass

def user_exist(nickname):
    """Return True if nickname is taken, otherwise False"""
    for user in logged_users:
        if user['name'] == nickname:
            return True

    return False

# def add_new_user(username):
#     pass

# def change_user_state(username, state):
#     user = logged_users.get(username)
#     user[name] = state
