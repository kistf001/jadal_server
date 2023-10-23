from flask import request
from flask_restx import Resource, Api, Namespace, fields
import pickle
from app.info_private import DATA_DIR
from app import db

with open(DATA_DIR, 'rb') as f:
    data = pickle.load(f) # 단 한줄씩 읽어옴

Ranking = Namespace(
    name="Ranking",
    description="보컬로이드 집계자들의 순위를 모아놓은 API",
    )

key = Ranking.model('Ranking', {  # Model 객체 생성
    'question_id': fields.String(description='Key of post', required=True, example="1")
    })

@Ranking.route('/list')
class Rankinglist(Resource):
    @Ranking.doc(responses={200: 'List of ranking'})
    @Ranking.doc(responses={404: 'Err'})
    def get(self):

        show_type = ""
        page = ""

        if "type" in request.args:
            show_type = request.args["type"]
        if "page" in request.args:
            page = request.args["page"]

        if show_type == "short":
            a = db.rank_list_short()
            return {"a":a}, 200
        if show_type == "long":
            try:
                page = (30 * abs(int(page)))-30
                a = db.rank_list_long(page)
                return {"a":a, "b":int(len(data))}, 200
            except:
                pass

        return {}, 404

@Ranking.route('/body')
class RankingBody(Resource):
    @Ranking.expect(key)
    @Ranking.doc(responses={200: 'List of ranking'})
    @Ranking.doc(responses={404: 'Err'})
    def get(self):
        return {"a":key}, 200
