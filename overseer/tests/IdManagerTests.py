import unittest
from collections import deque

from engine.id_manager import IdManager


class MyTestCase(unittest.TestCase):

    def test_sorted_deque(self):
        id_manager = IdManager()
        test_deque = deque([1, 3, 4, 5, 6, 7])

        id_manager.get_id()  # [1, 2, 3, 4, 5]
        id_manager.get_id()  # [2, 3, 4, 5, 6]
        id_manager.get_id()  # [3, 4, 5, 6, 7]
        id_manager.add_id(1)  # [1, 3, 4, 5, 6, 7]

        self.assertEqual(id_manager.free_ids, test_deque)

    def test_always_at_least_five(self):
        id_manager = IdManager()
        for i in range(7):
            id_manager.get_id()

        self.assertGreaterEqual(len(id_manager.free_ids), 5)

        id_manager.add_id(3)
        id_manager.add_id(1)

        for i in range(2):
            id_manager.get_id()

        self.assertGreaterEqual(len(id_manager.free_ids), 5)


if __name__ == '__main__':
    unittest.main()
