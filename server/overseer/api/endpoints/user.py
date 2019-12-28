import logging

from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restplus import Resource

from api import models
from api.restful import api
from engine.lobby import lobby

logger = logging.getLogger(__name__)

ns = api.namespace('user', description='Showing users and adding them')


@ns.route('/current_user')
class AuthGetCurrentUser(Resource):

    @ns.doc(security="apikey")
    @jwt_required
    def get(self):
        """Returns user info (id and username) by access token"""
        username_id = get_jwt_identity()
        user = lobby.users.get(username_id)
        return user.serialize(), 200


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