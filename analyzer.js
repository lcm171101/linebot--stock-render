const fetch = require('node-fetch');
const cheerio = require('cheerio');

// 模擬取得本益比（可改為爬 goodinfo.tw）
async function getPE(stockId) {
  return {
    current: (Math.random() * 20 + 10).toFixed(2),
    avg15y: (Math.random() * 15 + 5).toFixed(2),
    max15y: (Math.random() * 30 + 15).toFixed(2),
    min15y: (Math.random() * 5 + 5).toFixed(2),
  };
}

// 模擬取得技術指標（實際應串接 FinMind）
async function getTechnical(stockId) {
  return {
    MA5: 123.45,
    MA20: 120.11,
    MA60: 116.77,
    RSI14: 61.23,
    K: 78.9,
    D: 70.4,
    MACD_DIF: 1.23,
    MACD_OSC: -0.55
  };
}

async function analyzeStock(stockId) {
  const [pe, tech] = await Promise.all([
    getPE(stockId),
    getTechnical(stockId)
  ]);

  return {
    stockId,
    pe,
    tech,
    timestamp: new Date().toISOString()
  };
}

module.exports = { analyzeStock };