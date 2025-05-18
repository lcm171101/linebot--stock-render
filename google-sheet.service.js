
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

const SHEET_ID = '1RK9uzltVKRxeKfVyZS_I8eq564-JfKfanNCyi1vFvG0';

// 將 Service Account 金鑰放入環境變數 GOOGLE_SERVICE_KEY（整段 JSON）
const creds = JSON.parse(process.env.GOOGLE_SERVICE_KEY);

const client = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendStockData(rows) {
  const sheets = google.sheets({ version: 'v4', auth: client });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: '工作表1!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows,
    },
  });
}

module.exports = { appendStockData };
