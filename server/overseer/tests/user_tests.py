import unittest

from engine.user import User


class UserTestCase(unittest.TestCase):

    def test_serialization(self):
        user = User()
        user.id = 1
        user.name = 'Franco'
        serialized_user = user.serialize()

        self.assertEqual(serialized_user['name'], 'Franco')
        self.assertEqual(serialized_user['id'], 1)


if __name__ == '__main__':
    unittest.main()
