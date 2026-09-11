import { getStore } from '@netlify/blobs';

const TARGET_STEPS = 2775;

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Bad request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { steps, password } = body;

  // UPDATE_PASSWORD is set as an environment variable in the Netlify site
  // settings, never in this file, so it never ships to the browser.
  if (!process.env.UPDATE_PASSWORD || password !== process.env.UPDATE_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Wrong password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const clamped = Math.max(0, Math.min(parseInt(steps, 10) || 0, TARGET_STEPS));

  try {
    const store = getStore('move-a-mile');
    await store.setJSON('steps', { total: clamped, updatedAt: new Date().toISOString() });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'save_failed', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ ok: true, steps: clamped }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
