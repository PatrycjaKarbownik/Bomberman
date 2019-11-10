"""Collection of models used in endpoints"""
from flask_restplus import fields

from api.restful import api

room_with_usernames_model = api.model('RoomWithUsernamesModel', {
    'id': fields.Integer,
    'inGame': fields.Boolean,
    'users': fields.List(fields.String)
})

user_model = api.model('UserModel', {
    'name': fields.String,
    'id': fields.Integer
})

room_model = api.model('RoomModel', {
    'id': fields.Integer,
    'inGame': fields.Boolean,
    'users': fields.List(fields.Nested(user_model))
})
