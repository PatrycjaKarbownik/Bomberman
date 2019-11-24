import logging

from flask_jwt_extended import jwt_required
from flask_restplus import Resource

import api.models as models
import engine.lobby as lobby
from api.restful import api

logger = logging.getLogger(__name__)

ns = api.namespace('room', description='Operating on rooms in lobby')


@ns.route('/')
class RoomCollection(Resource):

    @api.marshal_list_with(models.room_with_usernames_model)
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


@ns.route('/add')
class RoomCreating(Resource):

    @jwt_required
    def post(self):
        room_id = lobby.create_room()
        return room_id, 200
