const admin = require('firebase-admin');

const base64 = process.env.FIREBASE_KEY_B64;
if (!base64) {
  throw new Error("FIREBASE_KEY_B64 環境變數未設定");
}

const decoded = Buffer.from(base64, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin.firestore();