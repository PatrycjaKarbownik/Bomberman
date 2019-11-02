import logging

from flask_restplus import Resource

from api.restful import api

logger = logging.getLogger(__name__)

ns = api.namespace('room', description='Operating on rooms in lobby')


@ns.route('/')
class UserCollection(Resource):

    def get(self):
        """Returns all rooms with all players"""
        return None
