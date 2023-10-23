from flask import request
from flask_restx import Resource, Api, Namespace, fields
from app import db

Jadal = Namespace(
    name="Jadal",
    description="번역된 가사와 싱크를 저장한 저장소",
    )

@Jadal.route('/list')
class PostListShort(Resource):
    @Jadal.doc(responses={200: 'List of jadal'})
    @Jadal.doc(responses={404: 'Err'})
    def get(self):
        dummy = [
            { "key":1, "title":"jadal_list", "date":"2019-05-11" },
            { "key":2, "title":"jadal_list", "date":"2019-05-11" },
            { "key":3, "title":"jadal_list", "date":"2019-05-11" },
            { "key":4, "title":"jadal_list", "date":"2019-05-11" },
            { "key":5, "title":"jadal_list", "date":"2019-05-11" },
            { "key":6, "title":"jadal_list", "date":"2019-05-11" },
            { "key":7, "title":"jadal_list", "date":"2019-05-11" },
            { "key":7, "title":"jadal_list", "date":"2019-05-11" },
            { "key":7, "title":"jadal_list", "date":"2019-05-11" },
            { "key":7, "title":"jadal_list", "date":"2019-05-11" },
            ]
        return {"data":dummy}, 200

@Jadal.route('/listLong')
class PostListLong(Resource):
    def get(self):
        id = int(request.args["page"])
        payload = db.jadal_get_wiki_list_long(id)
        print(id)
        dummy = [
            { 
                "key":a[0], 
                "title":a[2], 
                "date":"2019-05-11", 
                "artists":"deco*27" ,
                "singer":"miku",
                "url" : a[1]
                } for a in payload
            ]
        return {"data":dummy}, 200

@Jadal.route('/post')
class JadalBody(Resource):
    def get(self):
        id = request.args["kd"]
        payload = db.jadal_get_wiki_content(int(id))[0]
        if(2==len(payload)):
            return {
                "payload":payload[0],
                "url":payload[1]
                }, 200
        else :
            return {"err":""}, 404
