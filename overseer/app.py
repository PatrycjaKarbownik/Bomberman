from flask import Flask, Blueprint
from api.restful import api
from api.endpoints.user import ns as user_ns

# TODO 

app = Flask(__name__)

def configure_app(flask_app):
  flask_app.config['SWAGGER_UI_DOC_EXPANSION'] = 'list'
  flask_app.config['RESTPLUS_MASK_SWAGGER'] = False


def initialize_app(flask_app):
  configure_app(flask_app)

  blueprint = Blueprint('api', __name__, url_prefix='/api')
  api.init_app(blueprint)
  api.add_namespace(user_ns)
  flask_app.register_blueprint(blueprint)


if __name__ == '__main__':
  initialize_app(app)
  app.run(host='0.0.0.0', debug=True)