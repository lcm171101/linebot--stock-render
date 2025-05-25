
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from finmind.data import DataLoader

def analyze_stock(stock_id):
    result = {"id": stock_id}
    loader = DataLoader()
    data = loader.taiwan_stock_indicator(
        stock_id=stock_id,
        start_date="2024-01-01"
    )
    if data.empty:
        result["error"] = "No indicator data"
        return result
    last = data.iloc[-1]
    result.update({
        "RSI14": last.get("RSI14"),
        "K": last.get("K9"),
        "D": last.get("D9"),
        "MACD": last.get("MACD"),
        "OSC": last.get("OSC"),
        "MA5": last.get("MA5"),
        "MA20": last.get("MA20"),
        "MA60": last.get("MA60"),
    })
    try:
        url = f"https://goodinfo.tw/tw/StockFinDetail.asp?RPT_CAT=PER&STOCK_ID={stock_id}"
        headers = {"User-Agent": "Mozilla/5.0"}
        soup = BeautifulSoup(requests.get(url, headers=headers).text, "html.parser")
        pe = soup.select_one("table.b1.p4_2.r10.box_shadow table a:contains('本益比')")
        result["PE"] = pe.text if pe else "N/A"
    except Exception:
        result["PE"] = "N/A"
    result["time"] = datetime.now().isoformat()
    return result

def analyze_all_stocks(db):
    stock_ids = ["2330", "2317", "2454"]
    results = []
    for sid in stock_ids:
        res = analyze_stock(sid)
        db.collection("stocks").document(sid).set(res)
        results.append(res)
    return results
