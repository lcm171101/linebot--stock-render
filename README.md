
# 📊 LINE Bot 群組推播系統：IC 類股技術分析

這是一個 Node.js 應用程式，會從 Yahoo 股市自動擷取台灣上市 IC 類股（如台積電、聯電、鴻海）的即時股價資訊，並模擬技術分析（RSI、KD、MACD、法人買超）後，將推播訊息傳送至指定的 LINE 群組。

## 🚀 功能特色

- ✅ 擷取即時股價、漲跌幅
- ✅ 模擬技術指標（RSI、KD、MACD）
- ✅ 模擬外資買賣超分析
- ✅ 自動推播至指定 LINE 群組
- ✅ 不依賴 Google Sheets 或資料庫，完全靠網路擷取 + 運算

## 📦 安裝與部署

### ✅ 1. 安裝套件

```bash
npm install
```

### ✅ 2. 設定環境變數（.env 或 Render 上設定）

| 變數名稱        | 說明 |
|----------------|------|
| `LINE_TOKEN`   | 你的 LINE Bot Channel Access Token |
| `LINE_GROUP_ID`| 你要推播的 LINE 群組 ID（例如：`Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）|

### ✅ 3. 啟動伺服器

```bash
node index.js
```

## ✉️ 測試推播

啟動後，請在瀏覽器或 API 工具中打開以下網址：

```
GET /push
```

範例（若在 Render 部署）：

```
https://your-app.onrender.com/push
```

成功後：
- 畫面會顯示：`已推播至指定群組`
- 群組會收到包含分析結果的訊息

## 🧠 推播格式範例

```
【IC 類股技術分析（群組推播）】

台積電 924（+4.0）→ 可考慮買進
📈 指標：RSI 72、K=80 D=65、MACD=多頭趨勢
📊 法人：外資買賣超 1200 張
📌 評估：RSI 超買、黃金交叉、外資大買
```

## 🛠 技術架構

- Node.js + Express
- Axios + Cheerio 擷取網頁資料
- LINE Messaging API 推播訊息

## 📎 備註

- `RSI/KD/MACD/法人` 為模擬隨機邏輯，如需真實數據請搭配歷史資料庫或 API。
- 群組 ID 需從 LINE Bot 被加入群組後觸發 `/callback` 並讀取 Logs 取得。

## 📜 授權

MIT License
