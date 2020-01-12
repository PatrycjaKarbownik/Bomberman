import logging

from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restplus import Resource

from api import models
from api.restful import api
from api.translation_manager import Language
from api.translation_manager import translate as tr
from engine.lobby import lobby
from messages import message_codes as message

logger = logging.getLogger(__name__)

ns = api.namespace('user', description='Showing users and adding them')


@ns.route('/')
class UserCollection(Resource):

    @ns.doc(security="apikey")
    @jwt_required
    @api.marshal_list_with(models.user_model)
    def get(self):
        """Returns list of users"""
        return [user.serialize() for user in lobby.users.values()], 200


@ns.route('/exists/<string:username>')
class UserExists(Resource):

    def get(self, username):
        """Check whether user exists"""
        return lobby.user_exists(username), 200


@ns.route('/change-readiness')
class UserReady(Resource):

    @ns.doc(security="apikey")
    @jwt_required
    def put(self):
        user_id = get_jwt_identity()
        user = lobby.users.get(user_id)
        if user is None:
            logger.error('User id {} tried to change readiness in spite of being None'.format(user_id))
            return {
                       'type': 'SYSTEM',
                       'code': 'JWT_USER_ID_NON_EXISTENT',
                       'errorMessage': tr(message.error_user_id_non_existent, Language.POLISH)
                   }, 400

        room = lobby.rooms.get(user.room)
        if room is None:
            logger.error('{}({}) tried to change readiness outside room'.format(user.name, user.id))
            return {
                       'type': 'SYSTEM',
                       'code': 'ROOM_NON_EXISTENT',
                       'errorMessage': tr(message.error_room_does_not_exist, Language.POLISH)
                   }, 400

        user.switch_readiness()
        room.check_readiness()

        socketio_room_name = "room_{}".format(room.id)
        lobby.socketio.emit('room_state_changed', room.serialize(only_usernames=False), room=socketio_room_name)
        return 200
