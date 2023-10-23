
from flask import request, session
from flask_restx import Resource, Api, Namespace, fields
# from flask_wtf import FlaskForm

from wtforms import Form, fields as wtf_fields, validators

import jwt, bcrypt

from app import db
from app import logging

Auth = Namespace(name="Auth", description="사용자 인증을 위한 API")

regex_limitation_id = r"[a-zA-Z0-9]+"
regex_limitation_password = r"[a-zA-Z0-9!-\/:-@[-`{-~]+"

######################################################
#
######################################################
def user_email(form, field):

    if db.auth_cheack_user_is_exist(field.data):

        logging.info('email is exist.')

        raise validators.ValidationError(
            "The email {} is already taken.".format(field.data))

def user_name(form, field):

    if db.auth_cheack_name_is_exist(field.data):

        logging.info('name is exist.')

        raise validators.ValidationError(
            "The name {} is already taken.".format(field.data))

def user_id(form, field):

    if db.auth_cheack_id_is_exist(field.data):

        logging.info('id is exist.')

        raise validators.ValidationError(
            "The id {} is already taken.".format(field.data))

class Registration(Form):
    id = wtf_fields.StringField('id',[
        user_id,
        validators.Length(min=4, max=20),
        validators.Regexp(regex_limitation_id)
        ])
    email = wtf_fields.StringField('email',[
        user_email,
        validators.Email(),
        validators.Length(max=200)
        ])
    password = wtf_fields.StringField('password',[
        validators.Length(min=6, max=40),
        validators.Regexp(regex_limitation_password)
        ])
    name = wtf_fields.StringField('name',[
        user_name,
        validators.Length(min=2,max=10)
        ])

@Auth.route('/register')
class AuthRegister(Resource):

    def post(self):
        form = Registration(data=request.get_json())
    
        if not form.validate():

            logging.info('validate fail')
            
            return {
                "msg":"잘못된 입력 형식입니다.", 
                "type":1
                }, 400
    
        is_fail = db.auth_insert_user(
            form.name.data, 
            form.password.data, 
            form.email.data, 
            form.id.data)
    
        if not is_fail:
            return {}, 500
    
        return {}, 200

######################################################
#
######################################################
class ValidationLogin_email(Form):
    
    email = wtf_fields.StringField('email',[
        validators.Length(max=200),
        validators.Email(),
        ])

    password = wtf_fields.StringField('password',[
        validators.Length(min=6, max=40),
        validators.Regexp(regex_limitation_password)
        ])

class ValidationLogin_id(Form):

    id = wtf_fields.StringField('id',[
        validators.Length(min=4, max=20),
        validators.Regexp(regex_limitation_id)
        ])
        
    password = wtf_fields.StringField('password',[
        validators.Length(min=6, max=40),
        validators.Regexp(regex_limitation_password)
        ])

@Auth.route('/login')
class AuthLogin(Resource):

    def post(self):
        is_sucess = -1
        json = request.get_json()

        if ValidationLogin_email(
            data={"email": json["email"], "password": json["password"]}).validate():
            is_sucess = db.auth_login_use_email(json["password"], json["email"])
            logging.info("ValidationLogin_email : ",is_sucess)

        if ValidationLogin_id(
            data={"id" : json["email"], "password" : json["password"]}).validate():
            is_sucess = db.auth_login_use_id(json["password"], json["email"])
            logging.info("ValidationLogin_id : ",is_sucess)

        if is_sucess == True:
            session['username'] = request.get_json()["email"]
            logging.info("AuthLogin : "+str(session['username']))
            return {
                "login":True
                }, 200

        if is_sucess == False:
            logging.info("AuthLogin : ",session)
            return {
                "login":False
                }, 200

        return {"msg":"잘못된 요청"}, 400

######################################################
#
######################################################
@Auth.route('/logout')
class AuthLogout(Resource):
    def get(self):
        session.pop("username", None)
        print(session)
        return {'msg' : ""}, 200

######################################################
#
######################################################
@Auth.route('/init')
class AuthGet(Resource):
    def get(self):
        print(session['username'])
        if "username" in session:
            logging.info("AuthGet : true")
            return {
                'login' : True,
                "data" : 1,
                }, 200
        logging.info("AuthGet : false")
        return {"login":False}, 200