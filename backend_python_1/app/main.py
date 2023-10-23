from fastapi import FastAPI
from db import db
from routers import auth, jadal, rank
import config

app = FastAPI()

app.include_router(auth.router)
app.include_router(jadal.router)
app.include_router(rank.router)

# https://stackoverflow.com/questions/60819376/fastapi-throws-an-error-error-loading-asgi-app-could-not-import-module-api