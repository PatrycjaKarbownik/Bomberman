import logging

from flask_restplus import Resource

import engine.lobby as lobby
from api.restful import api

logger = logging.getLogger(__name__)

ns = api.namespace('user', description='Showing users and adding them :)')


@ns.route('/')
class UserCollection(Resource):

    def get(self):
        """Returns list of users"""
        return lobby.get_users(), 200


@ns.route('/exists/<string:username>')
class UserExists(Resource):

    def get(self, username):
        """Check whether user exists"""
        return lobby.user_exists(username), 200
