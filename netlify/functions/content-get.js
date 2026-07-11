const { getStore, connectLambda } = require('@netlify/blobs');

exports.handler = async (event) => {
  try {
    connectLambda(event);
    const store = getStore('cms-content');
    const data = (await store.get('overrides', { type: 'json' })) || {};
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({}),
    };
  }
};
