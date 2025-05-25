
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from firebase_util import init_firestore, get_stock_data
from callback import router as callback_router

app = FastAPI()
templates = Jinja2Templates(directory="templates")

db = init_firestore()
app.include_router(callback_router)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("stocks.html", {"request": request, "stocks": get_stock_data(db)})

from push import push_router
app.include_router(push_router)
