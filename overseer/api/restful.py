from flask_restplus import Api

api = Api(version='1.0', title='Overseer API')

@api.errorhandler
def default_error_handler(e):
    print(str(e))
