
import os
import json
import base64
from firebase_admin import credentials, firestore, initialize_app, get_app

def init_firestore():
    try:
        # 檢查是否已初始化過 Firebase
        get_app()
    except ValueError:
        encoded = os.getenv("FIREBASE_KEY_B64")
        if not encoded:
            raise ValueError("環境變數 FIREBASE_KEY_B64 未設定")
        decoded_json = base64.b64decode(encoded).decode()
        cred_dict = json.loads(decoded_json)
        cred = credentials.Certificate(cred_dict)
        initialize_app(cred)
    return firestore.client()

def get_stock_data(db):
    docs = db.collection("stocks").stream()
    return [doc.to_dict() for doc in docs]
