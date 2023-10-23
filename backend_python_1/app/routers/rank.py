from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from db import db

router = APIRouter(
    prefix="/api/rank",
    tags=["ranking"],
    responses={404: {"description": "Not found"}},
)

@router.get("/list")
async def read_items(type: int, page:Optional[int] = None):

    if page == None:
        page = 1

    page = page - 1

    if type == 0:
        return {
                "data" : db.ranking_list(0, 10)
            }

    elif type == 1:
        return {
            "data" :  db.ranking_list(page*30, 30),
            "maxPage": 20
            }
