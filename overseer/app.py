import logging.config

from flask import Flask, Blueprint
from flask_jwt_extended import JWTManager

import settings
from api.endpoints.authorization import ns as auth_ns
from api.endpoints.room import ns as room_ns
from api.endpoints.user import ns as user_ns
from api.restful import api
from engine.host_manager import host_manager
from api.translation_manager import Language
from api.translation_manager import translate as tr
from messages import message_codes as message

logging.config.fileConfig('logging.conf')
logger = logging.getLogger(__name__)

app = Flask(__name__)
jwt = JWTManager(app)


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


if __name__ == '__main__':
    initialize_app(app)
    # use_reloader parameter is set to False to prevent flask from starting twice in debug mode
    app.run(host=settings.FLASK_IP, debug=settings.DEBUG_MODE, use_reloader=False)
    host_manager.stop_work()
