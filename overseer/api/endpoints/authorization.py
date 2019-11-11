import logging

from flask_restplus import Resource

import engine.lobby as lobby
from api import models
from api.restful import api
from api.translation_manager import Language
from api.translation_manager import translate as tr
from messages import message_codes as message

logger = logging.getLogger(__name__)

ns = api.namespace('auth', description='Authorization actions')


@ns.route('/login')
class AuthLogin(Resource):

    @api.expect(models.login_model)
    def post(self):
        username = api.payload['username']
        if lobby.user_exists(username):
            return {
                       'type': 'error',
                       'errorMessage': tr(message.error_login_already_used, Language.POLISH)
                   }, 401
        user_id = lobby.add_user(username)
        return user_id, 200