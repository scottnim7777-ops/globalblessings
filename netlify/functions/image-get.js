const { getStore, connectLambda } = require('@netlify/blobs');

const CONTENT_TYPE_BY_EXT = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

exports.handler = async (event) => {
  const key = event.queryStringParameters && event.queryStringParameters.key;
  if (!key) {
    return { statusCode: 400, body: 'missing key' };
  }

  connectLambda(event);
  const store = getStore('cms-images');
  const buffer = await store.get(key, { type: 'arrayBuffer' });
  if (!buffer) {
    return { statusCode: 404, body: 'not found' };
  }

  const ext = (key.split('.').pop() || '').toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[ext] || 'application/octet-stream';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    body: Buffer.from(buffer).toString('base64'),
    isBase64Encoded: true,
  };
};
