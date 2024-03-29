import logging

from flask_jwt_extended import create_refresh_token, create_access_token, get_jwt_identity, jwt_refresh_token_required
from flask_restplus import Resource

from api import models
from api.restful import api
from api.translation_manager import Language
from api.translation_manager import translate as tr
from engine.lobby import lobby
from messages import message_codes as message

logger = logging.getLogger(__name__)

ns = api.namespace('auth', description='Authorization actions')


@ns.route('/login')
class AuthLogin(Resource):

    @api.expect(models.login_body_model)
    def post(self):
        username = api.payload['username']
        if lobby.user_exists(username):
            return {
                       'type': 'AUTH',
                       'code': 'USER_EXISTS',
                       'errorMessage': tr(message.error_login_already_used, Language.POLISH)
                   }, 401

        user_id = lobby.add_user(username)
        # TODO Maybe just return whole user instead of just id?
        user = lobby.users[user_id]

        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        user.access_token = 'Bearer ' + access_token
        user.refresh_token = 'Bearer ' + refresh_token

        return {
                    'userId': user_id,
                    'username': username,
                    'accessToken': access_token,
                    'refreshToken': refresh_token
               }, 200


@ns.route('/refresh')
class AuthRefresh(Resource):

    @ns.doc(security="apikey")
    @jwt_refresh_token_required
    def post(self):
        username_id = get_jwt_identity()
        user = lobby.users[username_id]
        user.access_token = create_access_token(identity=username_id)

        return {
                    'accessToken': user.access_token
               }, 200
