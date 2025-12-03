import { NextRequest, NextResponse } from 'next/server';

// Custom domain to site mapping
const domainToSite: Record<string, string> = {
  'dramyheart.com': 'dr-amy',
  'www.dramyheart.com': 'dr-amy',
};

// Auth token must match what's set in the login route
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const AUTH_TOKEN = 'cms_auth_' + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract the domain (remove port if present)
  const domain = hostname.split(':')[0];
  const isCustomDomain = domain !== 'localhost' && !domain.includes('vercel.app');

  // Protect admin routes (except login-related)
  if (url.pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('cms_admin_auth');

    if (!authCookie || authCookie.value !== AUTH_TOKEN) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/manage', request.url));
    }
  }

  // Skip middleware for these paths
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/site/') ||
    url.pathname.startsWith('/uploads/') ||
    url.pathname.startsWith('/manage') ||
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};