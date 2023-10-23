from flask import request
from flask_restx import Resource, Api, Namespace, fields
from app import db

Free = Namespace(name="Free", description="사용자 인증을 위한 API")
