import unittest
from collections import deque

from engine.id_manager import IdManager


class MyTestCase(unittest.TestCase):

    def test_sorted_deque(self):
        """Tests whether IdManager's list of spare id numbers is always sorted

        Most important job of IdManager is to keep giving smallest unoccupied id number possible. It is achieved by
        constantly keeping deque sorted.
        """
        id_manager = IdManager()
        sorted_deque = deque([1, 3, 4, 5, 6, 7])

        id_manager.get_id()  # [1, 2, 3, 4, 5]
        id_manager.get_id()  # [2, 3, 4, 5, 6]
        id_manager.get_id()  # [3, 4, 5, 6, 7]
        id_manager.add_id(1)  # [1, 3, 4, 5, 6, 7]

        self.assertEqual(id_manager.free_ids, sorted_deque)

    def test_always_at_least_five(self):
        """Test whether IdManager has always at least 5 free ids.

        As one of IdManager's attributes is that he always has at least 5 spare id numbers. It however serves no real
        purpose and should be removed in future.
        """
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
