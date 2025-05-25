
from fastapi import APIRouter, Request
from firebase_util import init_firestore
from firebase_admin import firestore

router = APIRouter()
db = init_firestore()

@router.post("/callback")
async def line_callback(request: Request):
    body = await request.json()
    for event in body.get("events", []):
        if event.get("type") == "follow":
            user_id = event["source"]["userId"]
            db.collection("line_users").document(user_id).set({
                "userId": user_id,
                "followed_at": firestore.SERVER_TIMESTAMP
            })
    return {"status": "ok"}
