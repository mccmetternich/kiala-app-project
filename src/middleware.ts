import { NextRequest, NextResponse } from 'next/server';

// Custom domain to site mapping
const domainToSite: Record<string, string> = {
  'dramyheart.com': 'dr-amy',
  'www.dramyheart.com': 'dr-amy',
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract the domain (remove port if present)
  const domain = hostname.split(':')[0];
  const isCustomDomain = domain !== 'localhost' && !domain.includes('vercel.app');

  // Skip middleware for these paths
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/site/') ||
    hostname === 'localhost:3000' ||
    hostname === '127.0.0.1:3000'
  ) {
    return NextResponse.next();
  }

  // For main app domain, skip (show admin dashboard)
  if (!isCustomDomain) {
    return NextResponse.next();
  }

  // Handle custom domains
  const siteId = domainToSite[domain];
  if (siteId) {
    // Rewrite to the site page and set a cookie with the siteId
    const newUrl = url.clone();
    newUrl.pathname = `/site/${siteId}${url.pathname}`;

    const response = NextResponse.rewrite(newUrl);
    // Set cookie so client-side can read the siteId
    response.cookies.set('x-site-id', siteId, {
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return new NextResponse('Site not found', { status: 404 });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
};