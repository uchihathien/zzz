import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Các routes không cần đăng nhập
const publicRoutes = [
    '/signin',
    '/signup',
    '/reset-password',
    '/two-step-verification',
    '/oauth2/callback',
    '/error-404',
    '/error-500',
    '/error-503',
    '/coming-soon',
    '/maintenance',
];

// Check if path is public
function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip API routes and static files
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/images') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Check for auth token in cookies or allow public routes
    const token = request.cookies.get('access_token')?.value;

    // For public routes, allow access
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // Note: Client-side only checks localStorage, middleware cannot access it
    // This middleware mainly serves as structural placeholder
    // Real auth check happens in client components

    return NextResponse.next();
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
