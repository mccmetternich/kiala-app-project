import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Extract the domain (remove port if present)
  const domain = hostname.split(':')[0];
  const isCustomDomain = domain !== 'localhost' && !domain.includes('vercel.app');

  // Skip middleware for these paths (but not for custom domains on root path)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/favicon.ico') ||
    hostname === 'localhost:3000' ||
    hostname === '127.0.0.1:3000'
  ) {
    return NextResponse.next();
  }

  // For main app domain, skip root path (show admin dashboard)
  if (!isCustomDomain && url.pathname === '/') {
    return NextResponse.next();
  }

  // For custom domains, detect the site and rewrite to dynamic route
  try {
    // Skip if it's the main app domain
    if (!isCustomDomain) {
      return NextResponse.next();
    }

    // This is a custom domain - check if site exists
    const siteResponse = await fetch(`${url.origin}/api/sites?domain=${domain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (siteResponse.ok) {
      const data = await siteResponse.json();
      if (data.site) {
        // Rewrite to the dynamic site route
        const newUrl = url.clone();
        newUrl.pathname = `/site/${data.site.id}${url.pathname}`;
        
        return NextResponse.rewrite(newUrl);
      }
    }
    
    // If no site found for this domain, show 404
    return new NextResponse('Site not found', { status: 404 });
    
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
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