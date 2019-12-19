import logging

from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restplus import Resource

import api.models as models
from api.restful import api
from api.translation_manager import Language
from api.translation_manager import translate as tr
from engine.lobby import lobby
from messages import message_codes as message

logger = logging.getLogger(__name__)

ns = api.namespace('room', description='Operating on rooms in lobby')


@ns.route('/')
class RoomCollection(Resource):

    @ns.doc(security="apikey")
    @jwt_required
    @api.marshal_list_with(models.room_with_usernames_model)
    def get(self):
        """Returns all rooms including their users usernames"""
        return lobby.get_json_rooms(only_usernames=True), 200


@ns.route('/<int:room_id>')
class RoomSpecific(Resource):

    @ns.doc(security="apikey")
    @jwt_required
    def get(self, room_id):
        """Returns room by id with specific data about its users"""
        room = lobby.rooms.get(room_id)
        if room is None:
            return None, 400

        return room.serialize(only_usernames=False), 200


@ns.route('/add')
class RoomCreating(Resource):

    @ns.doc(security="apikey")
    @jwt_required
    def post(self):
        room_id = lobby.create_room()
        return room_id, 200


@ns.route('/enter/<int:room_id>')
class RoomLeave(Resource):

    @ns.doc(security='apikey')
    @jwt_required
    def put(self, room_id):
        user_id = get_jwt_identity()
        user = lobby.users[user_id]

        if user.room is not None:
            return {
                       'type': 'ROOM',
                       'code': 'USER_ALREADY_IN_ROOM',
                       'errorMessage': tr(message.error_user_already_in_room, Language.POLISH)
                   }, 400

        if user_id not in lobby.rooms:
            return {
                       'type': 'ROOM',
                       'code': 'ROOM_NON_EXISTENT',
                       'errorMessage': tr(message.error_room_does_not_exist, Language.POLISH)
                   }, 400

        room = lobby.rooms[room_id]

        # >= instead of == just in case if for example some uknown race condition would let 5 people in
        if len(room.users) >= 4:
            return {
                       'type': 'ROOM',
                       'code': 'ROOM_FULL',
                       'errorMessage': tr(message.error_full_room, Language.POLISH)
                   }, 400

        user.room = room_id
        room.add_user(user)
        return 200


@ns.route('/leave')
class RoomLeave(Resource):

    @ns.doc(security='apikey')
    @jwt_required
    def put(self):
        pass
