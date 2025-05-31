const express = require('express');
const bodyParser = require('body-parser');
const db = require('./firebase');
const { analyzeStock } = require('./analyzer');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const STOCK_LIST = ['2330', '2317', '2454'];

app.get('/', async (req, res) => {
  const snapshot = await db.collection('stock_analysis').get();
  const data = [];
  snapshot.forEach(doc => data.push(doc.data()));

  const html = `
  <html><head><title>分析結果</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
  <body class="p-4">
    <h2>📊 股票分析結果</h2>
    <table class="table table-bordered table-striped">
      <thead><tr><th>股票代號</th><th>目前本益比</th><th>RSI</th><th>MACD</th><th>更新時間</th></tr></thead>
      <tbody>
        ${data.map(d => `
          <tr>
            <td>${d.stockId}</td>
            <td>${d.pe.current}</td>
            <td>${d.tech.RSI14}</td>
            <td>${d.tech.MACD_DIF}</td>
            <td>${d.timestamp}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <a href="/analyze" class="btn btn-primary">重新分析</a>
  </body></html>`;
  res.send(html);
});

app.get('/analyze', async (req, res) => {
  for (const stock of STOCK_LIST) {
    const result = await analyzeStock(stock);
    await db.collection('stock_analysis').doc(stock).set(result);
  }
  res.redirect('/');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ 分析伺服器啟動於 http://localhost:${port}`);
});