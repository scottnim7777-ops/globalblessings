const crypto = require('crypto');

const EDIT_PASSWORD = process.env.EDIT_PASSWORD;
const TOKEN_SECRET = process.env.EDIT_TOKEN_SECRET;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 180; // 180 days

function sign(expiry) {
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(String(expiry)).digest('hex');
  return `${expiry}.${hmac}`;
}

function issueToken() {
  const expiry = Date.now() + TOKEN_TTL_MS;
  return sign(expiry);
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [expiryStr, hmac] = token.split('.');
  const expiry = Number(expiryStr);
  if (!expiry || Number.isNaN(expiry)) return false;
  if (Date.now() > expiry) return false;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(String(expiry)).digest('hex');
  const a = Buffer.from(hmac || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function isAuthorized(event) {
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);
  return verifyToken(cookies.edit_token);
}

module.exports = { EDIT_PASSWORD, issueToken, verifyToken, parseCookies, isAuthorized, TOKEN_TTL_MS };
