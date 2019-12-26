from flask_restplus import Api

authorizations = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': "Type in the *'Value'* input box below: **'Bearer &lt;JWT&gt;'**, where JWT is the token"
    }
}

api = Api(version='1.0', title='Overseer API', authorizations=authorizations)


@api.errorhandler
def default_error_handler(e):
    print(str(e))
