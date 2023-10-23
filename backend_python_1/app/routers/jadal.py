from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from db import db

router = APIRouter(
    prefix="/api/wiki",
    tags=["items"],
    responses={404: {"description": "Not found"}},
)

@router.get("/list")
async def read_items(type: int, page:Optional[int] = None):
    if(type==0):
        return {"data" : db.wiki_list(0, 10)}
    elif(type==1):
        return {"data" : db.wiki_list(abs((page-1)*30),30)}

@router.get("")
async def read_items(id: int):
        data = db.wiki_content(id)
        return {
            "url" : data["url"],
            "content" : data["content"]
            }
