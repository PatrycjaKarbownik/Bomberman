import logging.config

from flask import Flask, Blueprint, request
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, emit

import settings
from api.endpoints.authorization import ns as auth_ns
from api.endpoints.room import ns as room_ns
from api.endpoints.user import ns as user_ns
from api.restful import api
from api.translation_manager import Language
from api.translation_manager import translate as tr
from engine.host_manager import host_manager
from engine.lobby import lobby
from messages import message_codes as message

logging.config.fileConfig('logging.conf')
logger = logging.getLogger(__name__)

app = Flask(__name__)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins='*')

wiadomosci_pati = []


@socketio.on('connect')
@jwt_required
def connect(jwt_token):
    user_id = get_jwt_identity()
    user = lobby.users[user_id]
    user.session_id = request.sid

@socketio.on('getMessages')
def handle_message():
    global wiadomosci_pati
    print('Received message! ', str())
    emit('getMessages', str(wiadomosci_pati))


@socketio.on('sendMessage')
def handle_json_message(json):
    global wiadomosci_pati
    print('Received json message! ', str(json))
    wiadomosci_pati.append(str(str(json) + 'doklejone'))
    emit('getMessages', str(wiadomosci_pati))


@jwt.expired_token_loader
def expired_token_callback(expired_token):
    token_type = expired_token['type']
    if token_type == 'access':
        error_code = 'ACCESS_TOKEN_EXPIRED'
        error_message = tr(message.error_access_token_expired, Language.POLISH)
    else:
        error_code = 'REFRESH_TOKEN_EXPIRED'
        error_message = tr(message.error_refresh_token_expired, Language.POLISH)

    return {
               'type': 'AUTH',
               'code': error_code,
               'errorMessage': error_message
           }, 401


def configure_app(flask_app):
    flask_app.config['SWAGGER_UI_DOC_EXPANSION'] = settings.SWAGGER_UI_DOC_EXPANSION
    flask_app.config['RESTPLUS_MASK_SWAGGER'] = settings.RESTPLUS_MASK_SWAGGER
    flask_app.config['JWT_SECRET_KEY'] = settings.JWT_SECRET_KEY
    flask_app.config['JWT_REFRESH_TOKEN_EXPIRES'] = settings.JWT_REFRESH_TOKEN_EXPIRES
    flask_app.config['JWT_ACCESS_TOKEN_EXPIRES'] = settings.JWT_ACCESS_TOKEN_EXPIRES


def initialize_app(flask_app):
    configure_app(flask_app)

    blueprint = Blueprint('api', __name__, url_prefix='/api')
    api.init_app(blueprint)
    api.add_namespace(user_ns)
    api.add_namespace(room_ns)
    api.add_namespace(auth_ns)
    flask_app.register_blueprint(blueprint)

    lobby.socketio = socketio


if __name__ == '__main__':
    initialize_app(app)
    # use_reloader parameter is set to False to prevent flask from starting twice in debug mode
    socketio.run(app, host=settings.FLASK_IP, debug=settings.DEBUG_MODE, use_reloader=False)
    host_manager.stop_work()
