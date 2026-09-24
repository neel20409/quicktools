export const dynamic = 'force-static';

export async function GET() {
  return new Response('google.com, pub-8023550227126773, DIRECT, f08c47fec0942fa0\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
