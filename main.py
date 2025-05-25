
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from firebase_util import init_firestore, get_stock_data
from analyzer import analyze_all_stocks
from linebot import push_summary

app = FastAPI()
templates = Jinja2Templates(directory="templates")

db = init_firestore()

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("stocks.html", {"request": request, "stocks": get_stock_data(db)})

@app.get("/analyze")
async def trigger_analysis():
    results = analyze_all_stocks(db)
    return {"status": "ok", "results": results}

@app.get("/push")
async def trigger_push():
    summary = push_summary(db)
    return {"status": "pushed", "content": summary}
