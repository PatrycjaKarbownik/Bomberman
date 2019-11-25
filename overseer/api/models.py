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

login_body_model = api.model('LoginBodyModel', {
    'username': fields.String
})

refresh_body_model = api.model('RefreshBodyModel', {
    'refreshToken': fields.String
})

login_response_model = api.model('LoginResponseModel', {
    'userId': fields.Integer,
    'accessToken': fields.String,
    'refreshToken': fields.String
})
