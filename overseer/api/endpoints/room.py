import logging

from flask_restplus import Resource

import engine.lobby as lobby
from api.restful import api

logger = logging.getLogger(__name__)

ns = api.namespace('room', description='Operating on rooms in lobby')


@ns.route('/')
class RoomCollection(Resource):

    def get(self):
        """Returns all rooms with all players"""
        return lobby.get_users(), 200


@ns.route('/add/')
class RoomCreating(Resource):

    def post(self):
        room_id = lobby.create_room()
        return room_id, 200