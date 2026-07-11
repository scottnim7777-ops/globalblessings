exports.handler = async () => {
  return {
    statusCode: 200,
    multiValueHeaders: {
      'Set-Cookie': [
        'edit_token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax',
        'edit_ui=; Max-Age=0; Path=/; Secure; SameSite=Lax',
      ],
    },
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
