"""Id manager is responsible for managing user identification numbers.

Every user has it's own id number. Id is just a number and because we do not want it to grow too large
without reason incrementing it with every new user would would not do. There could be users with ids 1004, 1323 and
34013 while server had max 5 players online.

Id manager is created to be a slightly more useful than this by keeping in mind which ids have not been taken yet and
which got freed.
"""

from collections import deque


class IdManager(object):
    free_ids = deque([0, 1, 2, 3, 4])
    new_id = 5

    def get_id(self):
        id = self.free_ids.popleft()
        if len(self.free_ids) < 5:
            self.free_ids.append(self.new_id)
            self.new_id += 1
        return id

    def add_id(self, id):
        i = 0
        for i in range(len(self.free_ids)):
            if id < self.free_ids[i]:
                self.free_ids.insert(i, id)
                break


# Instance of IdManager
id_manager = IdManager()
