from fastapi import APIRouter, Response, Cookie
from pydantic import BaseModel, EmailStr, Field, constr
from typing import Optional, Union, Tuple
from main import db
import redis

# 레디스 연결
rd = redis.StrictRedis(host='localhost', port=6379, db=0)

import jwt
import bcrypt

import config

def session_make(value):
   encoded = jwt.encode(value, config.auth["jwt"], algorithm="HS256")  # str
   return encoded
def session_read(value):
   decoded = jwt.decode(value, config.auth["jwt"], algorithms="HS256")  # dict
   return decoded

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

class Login(BaseModel):
    idString: Union[EmailStr, constr(max_length=20)]
    password: constr(max_length=40)
    autoLogin: bool
class Register(BaseModel):
    id: str
    email: str
    password: str
    name: str

@router.post("/login")
async def login(response: Response, item: Login):

    key = db.login_as_email(item.idString, item.password)
    if key:
        generatedJWT = session_make({"userId":key})
        response.set_cookie(key='key', value=generatedJWT)
        return {"login":True}

    key = db.login_as_id(item.idString, item.password)
    if key:
        generatedJWT = session_make({"userId":key})
        response.set_cookie(key='key', value=generatedJWT)
        return {"login":True}

    return {"login":False}

@router.get("/logout")
async def logout(response: Response, key: str = Cookie(default="")):
    response.set_cookie(key='key', value="")
    return {"logout":True}

@router.post("/register")
async def register(item: Register):
    if(db.auth_email_is_exist(item.email)):
        return {
            "register" : False, 
            "msg" : "email is already."
            }

    if(db.auth_id_is_exist(item.id)):
        return {
            "register" : False, 
            "msg" : "id is already."
            }

    if(db.auth_name_is_exist(item.name)):
        return {
            "register":False, 
            "msg" : "name is already."
            }

    if(db.auth_user_regist(item.email, item.id, item.password, item.name)):
        return {"register":True}

    return {"register":False}

@router.get("/init")
async def init(key: str = Cookie(default="")):
    if key=="":
        return {"login":False}
    else:
        try:
            recived_uuid = int(session_read(key)["userId"])
            if recived_uuid >= 0:
                return {"login":True}
        except:
            return {"login":False}
