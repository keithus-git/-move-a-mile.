import { getStore } from '@netlify/blobs';

export default async () => {
  const store = getStore('move-a-mile');
  const data = await store.get('steps', { type: 'json' });

  return new Response(JSON.stringify({ steps: data?.total ?? 0 }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
};
