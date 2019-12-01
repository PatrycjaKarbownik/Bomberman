import logging.config

from flask import Flask, Blueprint

import settings
from api.endpoints.authorization import ns as auth_ns
from api.endpoints.room import ns as room_ns
from api.endpoints.user import ns as user_ns
from api.restful import api
from engine.host_manager import host_manager

logging.config.fileConfig('logging.conf')
logger = logging.getLogger(__name__)

app = Flask(__name__)


def configure_app(flask_app):
    flask_app.config['SWAGGER_UI_DOC_EXPANSION'] = 'list'
    flask_app.config['RESTPLUS_MASK_SWAGGER'] = False


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
