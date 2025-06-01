const express = require('express');
const bodyParser = require('body-parser');
const db = require('./firebase');
const { analyzeStock } = require('./analyzer');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', async (req, res) => {
  const snapshot = await db.collection('stock_analysis').get();
  const data = [];
  snapshot.forEach(doc => data.push(doc.data()));

  const html = `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <title>股票技術與本益比分析</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body class="p-4">
    <h2>📊 股票技術指標與本益比</h2>
    <table class="table table-bordered table-sm">
      <thead><tr>
        <th>股票代號</th>
        <th>目前本益比</th><th>15年平均</th><th>15年最高</th><th>15年最低</th>
        <th>MA5</th><th>MA20</th><th>MA60</th><th>RSI14</th><th>K</th><th>D</th>
        <th>MACD DIF</th><th>MACD OSC</th><th>更新時間</th>
      </tr></thead>
      <tbody>
        ${data.map(d => `<tr>
          <td>${d.stockId}</td>
          <td>${d.pe?.current ?? ''}</td>
          <td>${d.pe?.avg15y ?? ''}</td>
          <td>${d.pe?.max15y ?? ''}</td>
          <td>${d.pe?.min15y ?? ''}</td>
          <td>${d.tech?.MA5 ?? ''}</td>
          <td>${d.tech?.MA20 ?? ''}</td>
          <td>${d.tech?.MA60 ?? ''}</td>
          <td>${d.tech?.RSI14 ?? ''}</td>
          <td>${d.tech?.K ?? ''}</td>
          <td>${d.tech?.D ?? ''}</td>
          <td>${d.tech?.MACD_DIF ?? ''}</td>
          <td>${d.tech?.MACD_OSC ?? ''}</td>
          <td>${d.timestamp ?? ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <a href="/analyze" class="btn btn-primary">手動分析</a>
  </body>
  </html>
  `;
  res.send(html);
});

app.get('/analyze', async (req, res) => {
  const stocks = ['2330', '2317', '2454'];
  for (const id of stocks) {
    const result = await analyzeStock(id);
    await db.collection('stock_analysis').doc(id).set(result);
  }
  res.redirect('/');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ 系統啟動 http://localhost:${port}`);
});