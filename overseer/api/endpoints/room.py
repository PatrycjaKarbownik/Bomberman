import logging

from flask_restplus import Resource

import engine.lobby as lobby
from api.restful import api

logger = logging.getLogger(__name__)

ns = api.namespace('room', description='Operating on rooms in lobby')


@ns.route('/')
class RoomCollection(Resource):

    def get(self):
        """Returns all rooms including their users usernames"""
        return lobby.get_json_rooms(only_usernames=True), 200


@ns.route('/<int:room_id>')
class RoomSpecific(Resource):

    def get(self, room_id):
        """Returns room by id with specific data about its users"""
        room = lobby.rooms.get(room_id)
        if room is None:
            return None, 400

        return room.serialize(only_usernames=False), 200


@ns.route('/add/')
class RoomCreating(Resource):

    def post(self):
        room_id = lobby.create_room()
        return room_id, 200
