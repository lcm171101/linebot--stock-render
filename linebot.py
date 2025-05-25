
import os
import requests

def push_summary(db):
    docs = db.collection("stocks").stream()
    messages = []
    for doc in docs:
        d = doc.to_dict()
        line = f"{d['id']} | RSI: {d.get('RSI14')} | MACD: {d.get('MACD')} | MA5: {d.get('MA5')}"
        messages.append(line)

    msg = "\n".join(messages)
    token = os.getenv("LINE_TOKEN")
    requests.post("https://api.line.me/v2/bot/message/push", json={
        "to": os.getenv("LINE_TARGET"),
        "messages": [{"type": "text", "text": msg}]
    }, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    })

    return msg
