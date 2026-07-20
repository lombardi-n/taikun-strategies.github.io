export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Job 1: relay contact form submissions to Google Sheets
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const data = await request.json();
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVQEu1-XzVvwgQpWNo9fMQ5_0kgMASu9Nz8RWPmIEswkVNqYCKmCQcyjKqs4DbOk3h1w/exec';

        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('Error:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Job 2: everything else — pass through to the real site, add security headers
    const response = await fetch(request);
    const headers = new Headers(response.headers);

    // Security Headers
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://formspree.io https://script.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io");
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
