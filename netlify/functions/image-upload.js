const { getStore, connectLambda } = require('@netlify/blobs');
const { isAuthorized } = require('./_auth');

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!isAuthorized(event)) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, error: 'unauthorized' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'bad_request' }) };
  }

  const { id, dataUrl } = body;
  if (typeof id !== 'string' || !id || typeof dataUrl !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'missing_fields' }) };
  }

  const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'invalid_image' }) };
  }
  const mime = match[1];
  const ext = EXT_BY_MIME[mime] || 'jpg';
  const buffer = Buffer.from(match[2], 'base64');

  if (buffer.length > 8 * 1024 * 1024) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'too_large' }) };
  }

  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  const key = `${safeId}-${Date.now()}.${ext}`;

  connectLambda(event);
  const imageStore = getStore('cms-images');
  await imageStore.set(key, buffer);

  const url = `/.netlify/functions/image-get?key=${encodeURIComponent(key)}`;

  const contentStore = getStore('cms-content');
  const current = (await contentStore.get('overrides', { type: 'json' })) || {};
  current[id] = url;
  await contentStore.setJSON('overrides', current);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, url }),
  };
};
