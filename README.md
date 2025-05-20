
# LINE Bot 推播系統（Firebase Firestore 版）

本專案使用 Firebase Firestore 作為 LINE Bot 推播 ID 的永久儲存方案，支援使用者或群組透過訊息「我想加入推播」主動加入，並可批次推播給所有使用者與群組。

---

## 📦 專案結構

```
├── index.js             # 主伺服器程式
├── package.json         # Node.js 相依套件
├── firebaseKey.json     # Firebase 私密金鑰（請自行新增）
```

---

## 🚀 Render 部署教學

### 1️⃣ Firebase 建立與金鑰下載

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立專案 → 設定 → 服務帳戶 → 產生金鑰 → 命名為 `firebaseKey.json`
3. 將 `firebaseKey.json` 放入本專案根目錄

---

### 2️⃣ Render 設定

1. 登入 [Render](https://render.com)
2. 建立 Web Service，設定：

| 項目           | 設定值          |
|----------------|-----------------|
| Build Command  | `npm install`   |
| Start Command  | `node index.js` |
| Environment    | `LINE_TOKEN=你的Token` |

---

### 3️⃣ LINE Webhook 設定

Webhook URL：
```
https://你的專案.onrender.com/callback
```

並啟用 Webhook。

---

## ✅ 使用說明

### 使用者/群組加入推播

只要傳送訊息：
```
我想加入推播
```
即可儲存 ID 至 Firestore。

### 推播 API

- 推播使用者：
  ```
  GET /push-users
  ```

- 推播群組：
  ```
  GET /push-groups
  ```

---

## 🔐 注意事項

- `firebaseKey.json` 為私密資訊，**請勿提交至 GitHub**
- 建議使用 `.gitignore` 排除金鑰檔案

---

## 📝 License

本專案授權方式為 MIT License。
