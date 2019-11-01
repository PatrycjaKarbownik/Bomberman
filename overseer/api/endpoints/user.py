from flask_restplus import Resource
from api.restful import api
import engine.lobby as lobby

ns = api.namespace('user', description='Showing users and adding them :)')

@ns.route('/')
class UserCollection(Resource):

  def get(self):
    """Returns list of users"""
    return lobby.get_users(), 200


# @ns.route('/<string:username>')
# class UserItem(Resource):

#   @api.response(200, 'User succesfully added.')
#   def post(self, username):
#     """Adds new username"""
#     users.append(username)
#     return None, 200


@ns.route('/exist/<string:username>')
class UserExist(Resource):

  def get(self, username):
    """Check whether user exists"""
    return lobby.user_exist(username), 200
