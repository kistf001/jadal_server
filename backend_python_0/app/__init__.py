from flask import Flask
from flask_restx import Api, Resource  # Api 구현을 위한 Api 객체 import
from flask_cors import CORS

from app import db
from app.info_private import SECRET_KEY

import logging

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
api = Api(
    app,
    version='1.0.0',
    title="jadal API Server",
    description="API Server",
    terms_url="/",
    contact="",
    license=""
    )  # Flask 객체에 Api 객체 등록

app.config['SECRET_KEY'] = SECRET_KEY
print(app.secret_key)

# cors = CORS(app, resources={r"/*": {"origins": "http://192.168.1.16:3000"}}, supports_credentials=True)

from .restApi.auth.auth import Auth
from .restApi.contents.ranking import Ranking
from .restApi.contents.jadal import Jadal
from .restApi.board.free import Free
api.add_namespace(Auth, '/api/auth')
api.add_namespace(Ranking, '/api/ranking')
api.add_namespace(Jadal, '/api/jadal')
api.add_namespace(Jadal, '/api/board')

if __name__ == "__main__":
    app.run(debug=True, host='localhost', port=5000)