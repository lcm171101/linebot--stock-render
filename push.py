
import os
import requests
from fastapi import APIRouter
from firebase_admin import firestore

push_router = APIRouter()
db = firestore.client()

@push_router.get("/push-to-all-users")
async def push_all():
    token = os.getenv("LINE_TOKEN")
    users_ref = db.collection("line_users").stream()
    results = []

    for doc in users_ref:
        user_id = doc.id
        body = {
            "to": user_id,
            "messages": [{"type": "text", "text": "📢 股票分析訊息通知（測試）"}]
        }
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        res = requests.post("https://api.line.me/v2/bot/message/push", json=body, headers=headers)
        results.append({ "user_id": user_id, "status": res.status_code })

    return { "pushed": results }
