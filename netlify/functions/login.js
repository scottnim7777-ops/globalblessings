const { EDIT_PASSWORD, issueToken, TOKEN_TTL_MS } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'bad_request' }) };
  }

  if (typeof body.password !== 'string' || body.password !== EDIT_PASSWORD) {
    return {
      statusCode: 401,
      body: JSON.stringify({ ok: false, error: 'wrong_password' }),
    };
  }

  const token = issueToken();
  const maxAge = Math.floor(TOKEN_TTL_MS / 1000);

  const cookieAuth = `edit_token=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
  const cookieUi = `edit_ui=1; Max-Age=${maxAge}; Path=/; Secure; SameSite=Lax`;

  return {
    statusCode: 200,
    multiValueHeaders: {
      'Set-Cookie': [cookieAuth, cookieUi],
    },
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
