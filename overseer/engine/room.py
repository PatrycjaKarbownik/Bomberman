from engine.user import *

MAX_USERS = 4  # Max number of users in room


class Room:
    def __init__(self):
        self.id = -1
        self.users = list()

    def add_user(self, user):
        """Add given user to room

        Args:
            user: User object which has to be added to room

        Returns:
            False if room reached it's capacity (4 players), otherwise True
        """
        if len(self.users) == MAX_USERS:
            return False

        self.users.append(user)
        user.room = self.id
        user.state = UserState.IN_ROOM
        return True

    def remove_user(self, user_id):
        """Removes given user from room

        First there is a check whether user with given id is in rum. Then he is removed from list of users
        and his state is changed to IN_LOBBY.

        Args:
            user_id: Id of user that has to be removed from room

        Returns:
            False if there was not a user with given id, otherwise True
        """
        user = None
        for u in self.users:
            if u.id == user_id:
                user = u
                break

        if user is None:
            return False

        self.users.remove(user)
        user.state = UserState.IN_LOBBY
