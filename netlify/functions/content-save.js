const { getStore, connectLambda } = require('@netlify/blobs');
const { isAuthorized } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!isAuthorized(event)) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, error: 'unauthorized' }) };
  }
  connectLambda(event);

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'bad_request' }) };
  }

  const { id, value } = body;
  if (typeof id !== 'string' || !id || typeof value !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'missing_fields' }) };
  }
  if (value.length > 20000) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'too_long' }) };
  }

  const store = getStore('cms-content');
  const current = (await store.get('overrides', { type: 'json' })) || {};
  current[id] = value;
  await store.setJSON('overrides', current);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
