import unittest

from engine.id_manager import IdManager
from engine.room import Room
from engine.user import User


class GeneralTestCase(unittest.TestCase):

    def setUp(self):
        self.room = Room()
        self.room.id = 0
        self.id_manager = IdManager()

    def test_remove_from_empty_room(self):
        self.assertFalse(self.room.remove_user(3))

    def test_add_user(self):
        user_a = User()
        user_a.id = self.id_manager.get_id()
        user_a.name = 'user_a'

        self.assertTrue(self.room.add_user(user_a))
        self.assertEqual(user_a, self.room.users[0])

    def test_add_too_much_users(self):
        user_a = User()
        user_b = User()
        user_c = User()
        user_d = User()
        user_e = User()
        should_be = [user_a, user_b, user_c, user_d]

        self.assertTrue(self.room.add_user(user_a))
        self.assertTrue(self.room.add_user(user_b))
        self.assertTrue(self.room.add_user(user_c))
        self.assertTrue(self.room.add_user(user_d))
        self.assertFalse(self.room.add_user(user_e))
        self.assertNotIn(user_e, self.room.users)
        self.assertEqual(self.room.users, should_be)

    def test_serialization(self):
        user_a = User()
        user_a.id = self.id_manager.get_id()
        user_a.name = 'user_a'

        user_b = User()
        user_b.id = self.id_manager.get_id()
        user_b.name = 'user_b'

        user_names = ['user_a', 'user_b']

        self.assertTrue(self.room.add_user(user_a))
        self.assertTrue(self.room.add_user(user_b))

        serialized = self.room.serialize(only_usernames=True)

        self.assertEqual(serialized['users'], user_names)
        self.assertEqual(serialized['id'], 0)
        self.assertFalse(serialized['inGame'])

        serialized = self.room.serialize(only_usernames=False)

        self.assertEqual('user_a', serialized['users'][0]['name'])
        self.assertEqual(0, serialized['users'][0]['id'])

        self.assertEqual('user_b', serialized['users'][1]['name'])
        self.assertEqual(1, serialized['users'][1]['id'])



if __name__ == '__main__':
    unittest.main()
