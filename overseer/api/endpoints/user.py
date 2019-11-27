import logging

from flask_jwt_extended import jwt_required
from flask_restplus import Resource

import engine.lobby as lobby
from api import models
from api.restful import api

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
